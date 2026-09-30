import { type ChildProcess } from 'child_process';
import { StdioEngine, type AudioState } from './engine';
export declare class MciEngine extends StdioEngine {

    private tmpWav;

    protected prepareSrc(src: string): Promise<string>;
    private cleanupTmp;
    dispose(): void;
    protected spawnChild(): ChildProcess | null;
    protected parseState(obj: any): AudioState | null;
}
export default MciEngine;
