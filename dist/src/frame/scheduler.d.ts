type FrameTask = () => void;
export declare function registerFrameTask(task: FrameTask): () => void;
export declare function scheduleFrame(): void;
export {};
