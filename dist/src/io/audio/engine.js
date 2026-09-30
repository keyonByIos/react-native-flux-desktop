"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdioEngine = void 0;
exports.createAudioEngine = createAudioEngine;
/** 轮询状态的间隔（ms） */
const POLL_MS = 250;
/**
 * 子进程 stdio 协议基类。子类实现 spawnChild / parseState。
 * 命令词表（各平台服务端须实现）：
 *   OPEN <path> | PLAY | PAUSE | STOP | SEEK <sec> | VOL <0..1> | STATUS
 * 服务端对 STATUS 回一行 JSON，字段随平台而定，由 parseState 归一。
 */
class StdioEngine {
    constructor() {
        this.child = null;
        this.state = { position: 0, duration: 0, playing: false, volume: 0.8 };
        this.poll = null;
        this.lineBuf = '';
        this.loop = false;
        this.onState = null;
        this.available = true;
    }
    /** 子类可覆写：把 src 规整为服务端能直接消费的路径（如把 URL 下载到临时文件） */
    async prepareSrc(src) {
        return src;
    }
    ensureStarted() {
        if (this.child || !this.available)
            return;
        const child = this.spawnChild();
        if (!child) {
            this.available = false;
            return;
        }
        this.child = child;
        if (child.stdout) {
            child.stdout.on('data', (chunk) => this.onStdout(chunk));
        }
        child.on('error', () => {
            this.available = false;
            this.child = null;
        });
        child.on('exit', () => {
            this.child = null;
        });
        this.poll = setInterval(() => this.send('STATUS'), POLL_MS);
    }
    onStdout(chunk) {
        this.lineBuf += chunk.toString('utf8');
        let idx;
        while ((idx = this.lineBuf.indexOf('\n')) >= 0) {
            const line = this.lineBuf.slice(0, idx).trim();
            this.lineBuf = this.lineBuf.slice(idx + 1);
            if (!line || line[0] !== '{')
                continue;
            let obj;
            try {
                obj = JSON.parse(line);
            }
            catch {
                continue;
            }
            // 服务端自检不可用（如 COM 组件缺失）：置 available=false，组件降级显示
            if (obj && obj.fatal) {
                this.available = false;
                if (this.onState)
                    this.onState(this.state);
                continue;
            }
            const next = this.parseState(obj);
            if (next) {
                this.state = next;
                // 循环：接近末尾且已停 → 回到起点重播。MCI/AVAudioPlayer 播完后 position 停在末尾，
                // 单发 PLAY 会从末尾“播”一下立即停 → 必须先 SEEK 0 再 PLAY。
                if (this.loop && !next.playing && next.duration > 0 && next.position >= next.duration - 0.25) {
                    this.send('SEEK 0');
                    this.send('PLAY');
                }
                if (this.onState)
                    this.onState(next);
            }
        }
    }
    send(cmd) {
        if (!this.child || !this.child.stdin || !this.child.stdin.writable)
            return;
        try {
            this.child.stdin.write(cmd + '\n');
        }
        catch {
            /* 子进程已退出，忽略 */
        }
    }
    async load(src, opts) {
        if (!this.available)
            return false;
        this.ensureStarted();
        if (!this.child)
            return false;
        const prepared = await this.prepareSrc(src);
        // 路径可能含空格：整行除首个命令词外都当参数，服务端按剩余整串取路径
        this.send('OPEN ' + prepared);
        if (opts && opts.autoplay)
            this.send('PLAY');
        return true;
    }
    play() {
        this.ensureStarted();
        this.send('PLAY');
    }
    pause() {
        this.send('PAUSE');
    }
    stop() {
        this.send('STOP');
    }
    seek(seconds) {
        this.send('SEEK ' + Math.max(0, seconds).toFixed(3));
    }
    setVolume(v) {
        const c = Math.max(0, Math.min(1, v));
        this.state = { ...this.state, volume: c };
        this.send('VOL ' + c.toFixed(3));
    }
    setLoop(loop) {
        this.loop = loop;
    }
    getState() {
        return { ...this.state };
    }
    setOnState(cb) {
        this.onState = cb;
    }
    dispose() {
        if (this.poll) {
            clearInterval(this.poll);
            this.poll = null;
        }
        if (this.child) {
            this.send('QUIT');
            const c = this.child;
            this.child = null;
            try {
                c.kill();
            }
            catch {
                /* ignore */
            }
        }
        if (this.onState)
            this.onState(this.state);
    }
}
exports.StdioEngine = StdioEngine;
/** 无音频能力平台的空实现：所有操作静默无效，组件据此降级显示 */
class NullEngine {
    constructor() {
        this.available = false;
    }
    async load() {
        return false;
    }
    play() { }
    pause() { }
    stop() { }
    seek() { }
    setVolume() { }
    setLoop() { }
    getState() {
        return { position: 0, duration: 0, playing: false, volume: 0.8 };
    }
    setOnState() { }
    dispose() { }
}
// 平台实现按懒加载引入，避免在非目标平台 require 到不相关代码。
const win_mci_1 = require("./win-mci");
const mac_av_1 = require("./mac-av");
/** 工厂：按当前平台返回对应音频引擎（未知平台返回不可用的 NullEngine） */
function createAudioEngine() {
    switch (process.platform) {
        case 'win32':
            return new win_mci_1.MciEngine();
        case 'darwin':
            return new mac_av_1.AvAudioEngine();
        default:
            return new NullEngine();
    }
}
