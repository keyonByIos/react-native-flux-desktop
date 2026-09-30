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

export declare function probe(src: string): Promise<VideoMeta>;
export interface FrameDecoderOptions {

    id: number;
    src: string;

    maxEdge?: number;
}

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

    start(autoplay?: boolean): void;
    play(): void;
    pause(): void;

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
