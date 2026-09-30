"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSingleInstanceEnforced = isSingleInstanceEnforced;
exports.onSecondInstance = onSecondInstance;
exports.acquireSingleInstance = acquireSingleInstance;
exports.releaseSingleInstance = releaseSingleInstance;
// 单实例锁 + 次实例唤起：生产环境保证全局只跑一个进程；开发环境（未打包）放行，可多开。
// 锁：纯 Node 实现（无需原生重编）——临时目录放一个记录 PID 的锁文件，用 'wx' 原子独占创建。
//     脏锁（持锁进程崩溃/被强杀未清理）靠 PID 探活自动接管，不会永久卡死后续启动。
// 唤起：主实例起一个本地 IPC 服务（Windows 命名管道 / POSIX unix socket）；次实例抢锁失败时
//     连上该服务把 argv/cwd/pid 递过去（deep-link 语义），再自行退出。主实例收到后回调 onSecondInstance，
//     由上层（gallery）唤醒老窗（Application.wakeMainWindow → host.focus → native focus_window）。
// 依赖纪律：本模块是叶子，只 import log，绝不 import renderer / window/host（防循环）；唤起动作经回调注入。
const fs_1 = __importDefault(require("fs"));
const net_1 = __importDefault(require("net"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const log_1 = require("../log");
/**
 * 是否启用单实例约束：
 * - 本项目以 FLUX_PACKAGED 标记打包/生产运行；亦认 NODE_ENV=production。
 * - FLUX_SINGLE_INSTANCE=1 可强制启用（便于开发下自测锁行为）。
 * - FLUX_ALLOW_MULTI=1 可强制放行（临时允许多开）。
 */
function isSingleInstanceEnforced() {
    if (process.env.FLUX_ALLOW_MULTI === '1')
        return false;
    if (process.env.FLUX_SINGLE_INSTANCE === '1')
        return true;
    return !!process.env.FLUX_PACKAGED || process.env.NODE_ENV === 'production';
}
let lockPath = null;
let server = null;
let pipeName = null;
let secondInstanceHandler = null;
/**
 * 注册「次实例再次启动」回调（仅主实例侧有意义）：次实例经本地 IPC 转交 payload 时触发。
 * 上层通常在此唤醒/前置主窗（Application.wakeMainWindow），并可读取 payload.argv 处理 deep-link。
 * 可在 acquireSingleInstance 之前或之后调用；后注册覆盖先注册。
 */
function onSecondInstance(cb) {
    secondInstanceHandler = cb;
}
/** 目标 PID 是否仍存活（signal 0 探测：不发信号，仅判存在性） */
function pidAlive(pid) {
    if (!pid || pid <= 0)
        return false;
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (e) {
        // EPERM：进程存在但无权限探测（视为存活）；ESRCH：进程不存在
        return e.code === 'EPERM';
    }
}
/** 本地 IPC 端点：Windows 走命名管道，其余走 tmpdir 下的 unix socket 文件 */
function pipePathOf(name) {
    return process.platform === 'win32'
        ? `\\\\.\\pipe\\${name}.single-instance`
        : path_1.default.join(os_1.default.tmpdir(), `${name}.single-instance.sock`);
}
/** 主实例：起服务监听次实例的唤起请求，收到后回调 onSecondInstance */
function startSecondInstanceServer(name) {
    const p = pipePathOf(name);
    // POSIX：清掉上次崩溃残留的 socket 文件，否则 listen 会 EADDRINUSE
    if (process.platform !== 'win32') {
        try {
            if (fs_1.default.existsSync(p))
                fs_1.default.unlinkSync(p);
        }
        catch {
            /* ignore */
        }
    }
    try {
        server = net_1.default.createServer((conn) => {
            let buf = '';
            conn.on('data', (d) => {
                buf += d.toString('utf8');
            });
            conn.on('error', () => {
                /* 对端提前断开：忽略 */
            });
            conn.on('end', () => {
                let payload;
                try {
                    payload = JSON.parse(buf || '{}');
                }
                catch {
                    payload = { argv: [], cwd: '', pid: 0 };
                }
                (0, log_1.sysLog)(`[instance] second-instance request (pid=${payload.pid ?? '?'}); dispatching handler`);
                try {
                    secondInstanceHandler?.(payload);
                }
                catch (e) {
                    (0, log_1.sysLog)(`[instance] second-instance handler threw: ${e.message}`);
                }
            });
        });
        server.on('error', (e) => (0, log_1.sysLog)(`[instance] pipe server error: ${e.message}`));
        server.listen(p, () => (0, log_1.sysLog)(`[instance] second-instance server listening on ${p}`));
    }
    catch (e) {
        (0, log_1.sysLog)(`[instance] failed to start second-instance server: ${e.message}`);
    }
}
/** 次实例：连主实例的服务，递送 payload。返回在连接关闭/出错/超时后 resolve 的 Promise（供发送完成后退出） */
function notifyFirstInstance(name, payload) {
    return new Promise((resolve) => {
        let done = false;
        const finish = () => {
            if (!done) {
                done = true;
                resolve();
            }
        };
        try {
            const sock = net_1.default.connect(pipePathOf(name));
            const timer = setTimeout(() => {
                try {
                    sock.destroy();
                }
                catch {
                    /* ignore */
                }
                finish();
            }, 500);
            sock.on('connect', () => {
                try {
                    sock.write(JSON.stringify(payload));
                    sock.end();
                }
                catch {
                    /* ignore */
                }
            });
            sock.on('close', () => {
                clearTimeout(timer);
                finish();
            });
            sock.on('error', (e) => {
                (0, log_1.sysLog)(`[instance] notify primary failed: ${e.message}`);
                clearTimeout(timer);
                finish();
            });
        }
        catch (e) {
            (0, log_1.sysLog)(`[instance] notify threw: ${e.message}`);
            finish();
        }
    });
}
/**
 * 次实例收尾：通知主实例唤醒 → 发送完成后退出（800ms 兜底强退）。
 * 关键：不在本函数同步 process.exit，否则 socket 数据未 flush 就被掐断，老窗收不到唤起。
 */
function exitAsSecondary(name, reason) {
    (0, log_1.sysLog)(`[instance] ${reason}; notifying primary instance then exiting`);
    const payload = { argv: process.argv.slice(1), cwd: process.cwd(), pid: process.pid };
    void notifyFirstInstance(name, payload).then(() => process.exit(0));
    const t = setTimeout(() => process.exit(0), 800);
    t.unref?.(); // 兜底定时器不额外续命：正常靠 socket close 触发上面的 then 退出
    return false;
}
/**
 * 抢占单实例锁。返回 true = 可继续建窗（主实例 / 已放行）；
 * 返回 false = 已有实例在跑（次实例）：本函数已负责通知主实例唤醒并在发送完成后安排进程退出，
 * 调用方只需停止后续启动（不要再同步 process.exit，否则会掐断 IPC 发送）。
 * 开发环境（未打包 / allowMulti）恒返回 true（放行多开，不起服务）。
 */
function acquireSingleInstance(opts = {}) {
    const o = typeof opts === 'string' ? { name: opts } : opts;
    if (o.onSecondInstance)
        secondInstanceHandler = o.onSecondInstance;
    if (o.allowMulti) {
        (0, log_1.sysLog)('[instance] multi-instance allowed (allowMulti, no lock)');
        return true; // 配置显式允许多开 → 不加锁、不起服务
    }
    if (!isSingleInstanceEnforced())
        return true; // 开发环境放行（不记锁事件、不起服务）
    const name = o.name || 'react-native-flux-desktop';
    pipeName = name;
    lockPath = path_1.default.join(os_1.default.tmpdir(), `${name}.single-instance.lock`);
    // 1) 已有锁：若持锁进程存活且非自己 → 次实例（通知后退出）；否则视为脏锁，清掉后重建
    try {
        const pid = parseInt(fs_1.default.readFileSync(lockPath, 'utf8').trim(), 10);
        if (pid && pid !== process.pid && pidAlive(pid)) {
            return exitAsSecondary(name, `live instance detected pid=${pid}`);
        }
        if (pid && pid !== process.pid) {
            (0, log_1.sysLog)(`[instance] stale lock pid=${pid} (process gone), taking over`);
        }
        try {
            fs_1.default.unlinkSync(lockPath);
        }
        catch {
            /* 竞态下可能已被他人清掉，忽略 */
        }
    }
    catch {
        /* 文件不存在：正常路径 */
    }
    // 2) 原子独占创建（'wx'：文件已存在即抛 EEXIST，天然防并发竞态）
    let fd;
    try {
        fd = fs_1.default.openSync(lockPath, 'wx');
    }
    catch (e) {
        if (e.code === 'EEXIST') {
            return exitAsSecondary(name, 'concurrent acquire failed (EEXIST)');
        }
        return true; // 其他 IO 异常：不阻塞启动，放行
    }
    try {
        fs_1.default.writeSync(fd, String(process.pid));
        try {
            fs_1.default.fsyncSync(fd);
        }
        catch {
            /* ignore */
        }
    }
    finally {
        fs_1.default.closeSync(fd);
    }
    (0, log_1.sysLog)(`[instance] primary instance lock acquired pid=${process.pid} name=${name}`);
    // 3) 主实例起 IPC 服务，等待次实例唤起请求
    startSecondInstanceServer(name);
    // 4) 正常退出清锁 + 关服务；崩溃/强杀由下次启动的 PID 探活兜底接管脏锁
    const cleanup = () => {
        try {
            server?.close();
        }
        catch {
            /* ignore */
        }
        try {
            if (lockPath && fs_1.default.existsSync(lockPath))
                fs_1.default.unlinkSync(lockPath);
        }
        catch {
            /* ignore */
        }
        if (process.platform !== 'win32' && pipeName) {
            try {
                const sp = pipePathOf(pipeName);
                if (fs_1.default.existsSync(sp))
                    fs_1.default.unlinkSync(sp);
            }
            catch {
                /* ignore */
            }
        }
    };
    process.once('exit', cleanup);
    process.once('SIGINT', () => {
        cleanup();
        process.exit(0);
    });
    process.once('SIGTERM', () => {
        cleanup();
        process.exit(0);
    });
    return true;
}
/** 主动释放锁（一般无需手动调用，进程退出会自动清理） */
function releaseSingleInstance() {
    try {
        server?.close();
    }
    catch {
        /* ignore */
    }
    server = null;
    try {
        if (lockPath && fs_1.default.existsSync(lockPath))
            fs_1.default.unlinkSync(lockPath);
    }
    catch {
        /* ignore */
    }
    lockPath = null;
}
