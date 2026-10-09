import type { ChildProcess } from 'child_process';
export interface AudioState {
    /** 当前播放位置（秒） */
    position: number;
    /** 总时长（秒）；未就绪时为 0 */
    duration: number;
    /** 是否正在播放 */
    playing: boolean;
    /** 音量 0..1 */
    volume: number;
}
export interface AudioEngine {
    /** 加载音源（本地路径或 URL）；autoplay 立即播放。返回引擎是否可用 */
    load(src: string, opts?: {
        autoplay?: boolean;
    }): Promise<boolean>;
    play(): void;
    pause(): void;
    /** 停止并回到起点 */
    stop(): void;
    /** 跳到指定秒 */
    seek(seconds: number): void;
    /** 设音量 0..1 */
    setVolume(v: number): void;
    /** 循环开关 */
    setLoop(loop: boolean): void;
    /** 读取最近一次轮询到的状态（无副作用） */
    getState(): AudioState;
    /** 订阅状态更新（每次解析到子进程回报时触发） */
    setOnState(cb: ((s: AudioState) => void) | null): void;
    /** 释放：停轮询 + 杀子进程 */
    dispose(): void;
    /** 当前平台是否有可用音频引擎 */
    readonly available: boolean;
}
/**
 * 子进程 stdio 协议基类。子类实现 spawnChild / parseState。
 * 命令词表（各平台服务端须实现）：
 *   OPEN <path> | PLAY | PAUSE | STOP | SEEK <sec> | VOL <0..1> | STATUS
 * 服务端对 STATUS 回一行 JSON，字段随平台而定，由 parseState 归一。
 */
export declare abstract class StdioEngine implements AudioEngine {
    protected child: ChildProcess | null;
    protected state: AudioState;
    protected poll: ReturnType<typeof setInterval> | null;
    protected lineBuf: string;
    protected loop: boolean;
    protected onState: ((s: AudioState) => void) | null;
    available: boolean;
    /** 子类：拉起子进程（含服务端脚本/编译）；失败应置 available=false 并返回 null */
    protected abstract spawnChild(): ChildProcess | null;
    /** 子类：把服务端回报的一行 JSON 归一成 AudioState（可返回 null 表示非状态行） */
    protected abstract parseState(obj: any): AudioState | null;
    /** 子类可覆写：把 src 规整为服务端能直接消费的路径（如把 URL 下载到临时文件） */
    protected prepareSrc(src: string): Promise<string>;
    protected ensureStarted(): void;
    private onStdout;
    protected send(cmd: string): void;
    load(src: string, opts?: {
        autoplay?: boolean;
    }): Promise<boolean>;
    play(): void;
    pause(): void;
    stop(): void;
    seek(seconds: number): void;
    setVolume(v: number): void;
    setLoop(loop: boolean): void;
    getState(): AudioState;
    setOnState(cb: ((s: AudioState) => void) | null): void;
    dispose(): void;
}
/** 工厂：按当前平台返回对应音频引擎（未知平台返回不可用的 NullEngine） */
export declare function createAudioEngine(): AudioEngine;
