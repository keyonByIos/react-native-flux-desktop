import { type ChildProcess } from 'child_process';
import { StdioEngine, type AudioState } from './engine';
export declare class AvAudioEngine extends StdioEngine {

    protected prepareSrc(src: string): Promise<string>;
    protected spawnChild(): ChildProcess | null;
    protected parseState(obj: any): AudioState | null;
}
export default AvAudioEngine;
