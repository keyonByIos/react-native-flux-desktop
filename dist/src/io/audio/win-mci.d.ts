import { type ChildProcess } from 'child_process';
import { StdioEngine, type AudioState } from './engine';
export declare class MciEngine extends StdioEngine {
    /** 上一次转码生成的临时 wav（下次转码前 / dispose 时清理） */
    private tmpWav;
    /**
     * 统一走 ffmpeg：本地非 wav 文件先解码成临时 WAV 再交给 MCI。
     * wav / URL 原样交给 MCI（wav 本就能直播、URL 由 MCI 流式处理）；无 ffmpeg 时也原样返回。
     */
    protected prepareSrc(src: string): Promise<string>;
    private cleanupTmp;
    dispose(): void;
    protected spawnChild(): ChildProcess | null;
    protected parseState(obj: any): AudioState | null;
}
export default MciEngine;
