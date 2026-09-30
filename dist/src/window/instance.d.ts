/**
 * 是否启用单实例约束：
 * - 本项目以 FLUX_PACKAGED 标记打包/生产运行；亦认 NODE_ENV=production。
 * - FLUX_SINGLE_INSTANCE=1 可强制启用（便于开发下自测锁行为）。
 * - FLUX_ALLOW_MULTI=1 可强制放行（临时允许多开）。
 */
export declare function isSingleInstanceEnforced(): boolean;
/** 次实例转交的启动上下文（供主实例做 deep-link / 打开文件等） */
export interface SecondInstancePayload {
    /** 次实例的 process.argv.slice(1)（不含 node/exe 与脚本路径） */
    argv: string[];
    /** 次实例的工作目录 */
    cwd: string;
    /** 次实例进程号（0 = 未知） */
    pid: number;
}
type SecondInstanceHandler = (payload: SecondInstancePayload) => void;
/**
 * 注册「次实例再次启动」回调（仅主实例侧有意义）：次实例经本地 IPC 转交 payload 时触发。
 * 上层通常在此唤醒/前置主窗（Application.wakeMainWindow），并可读取 payload.argv 处理 deep-link。
 * 可在 acquireSingleInstance 之前或之后调用；后注册覆盖先注册。
 */
export declare function onSecondInstance(cb: SecondInstanceHandler): void;
export interface SingleInstanceOptions {
    /** 锁名（决定锁文件与 IPC 端点路径），默认 'react-native-flux-desktop' */
    name?: string;
    /** 显式允许多开：true 时直接放行、不加锁（供 app.json allowMultiOpen 在打包下覆盖单实例约束） */
    allowMulti?: boolean;
    /** 便捷入参：等价于随后调用 onSecondInstance(cb)（仅主实例侧触发） */
    onSecondInstance?: SecondInstanceHandler;
}
/**
 * 抢占单实例锁。返回 true = 可继续建窗（主实例 / 已放行）；
 * 返回 false = 已有实例在跑（次实例）：本函数已负责通知主实例唤醒并在发送完成后安排进程退出，
 * 调用方只需停止后续启动（不要再同步 process.exit，否则会掐断 IPC 发送）。
 * 开发环境（未打包 / allowMulti）恒返回 true（放行多开，不起服务）。
 */
export declare function acquireSingleInstance(opts?: string | SingleInstanceOptions): boolean;
/** 主动释放锁（一般无需手动调用，进程退出会自动清理） */
export declare function releaseSingleInstance(): void;
export {};
