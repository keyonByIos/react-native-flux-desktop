import { type ChildProcess } from 'child_process';
import { StdioEngine, type AudioState } from './engine';
export declare class AvAudioEngine extends StdioEngine {
    /** AVAudioPlayer 不能直接流式播放 http URL：先把网络音频下载到临时文件再交给助手（Windows 的 WMP 能直接吃 URL，故只有这里覆写） */
    protected prepareSrc(src: string): Promise<string>;
    protected spawnChild(): ChildProcess | null;
    protected parseState(obj: any): AudioState | null;
}
export default AvAudioEngine;
