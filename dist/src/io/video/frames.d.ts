export interface VideoMeta {
    duration: number;
    width: number;
    height: number;
    fps: number;
}
export interface FrameState {
    position: number;
    duration: number;
    playing: boolean;
}
/** 探测媒体元信息（时长/尺寸/帧率）。ffmpeg 不可用或解析失败即 reject。 */
export declare function probe(src: string): Promise<VideoMeta>;
export interface FrameDecoderOptions {
    /** 帧槽 id（与 <Video videoId> 一致） */
    id: number;
    src: string;
    /** 解码长边上限，默认 640 */
    maxEdge?: number;
}
/** 单实例解码器：常驻一条 ffmpeg 解码管道 + 一个 fps 定时器。 */
export declare class FrameDecoder {
    private readonly opts;
    private readonly meta;
    readonly dw: number;
    readonly dh: number;
    private readonly frameBytes;
    private readonly ff;
    private child;
    private timer;
    private queue;
    private pending;
    private streamPaused;
    private killing;
    private childClosed;
    private playing;
    private startSec;
    private consumed;
    private prime;
    onState: ((s: FrameState) => void) | null;
    onEnd: (() => void) | null;
    constructor(opts: FrameDecoderOptions, meta: VideoMeta);
    get duration(): number;
    get aspect(): number;
    /** 起流；autoplay=true 时同时开始按帧率上屏 */
    start(autoplay?: boolean): void;
    play(): void;
    pause(): void;
    /** 跳转到秒（重生解码管道，输入侧 -ss 快速 seek） */
    seek(sec: number): void;
    dispose(): void;
    private finished;
    private spawnStream;
    private onBytes;
    private takeOne;
    private step;
    private ensureTimer;
    private clearTimer;
    private pauseStream;
    private resumeStream;
    private killChild;
    private emit;
}
