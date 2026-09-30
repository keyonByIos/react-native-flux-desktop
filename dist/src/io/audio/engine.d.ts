import type { ChildProcess } from 'child_process';
export interface AudioState {

    position: number;

    duration: number;

    playing: boolean;

    volume: number;
}
export interface AudioEngine {

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

    readonly available: boolean;
}

export declare abstract class StdioEngine implements AudioEngine {
    protected child: ChildProcess | null;
    protected state: AudioState;
    protected poll: ReturnType<typeof setInterval> | null;
    protected lineBuf: string;
    protected loop: boolean;
    protected onState: ((s: AudioState) => void) | null;
    available: boolean;

    protected abstract spawnChild(): ChildProcess | null;

    protected abstract parseState(obj: any): AudioState | null;

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

export declare function createAudioEngine(): AudioEngine;
