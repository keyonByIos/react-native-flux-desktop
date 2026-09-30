
export declare function allocFrameSlot(id: number, width: number, height: number): void;

export declare function setFrame(id: number, rgba: Buffer): void;

export declare function peekFrame(id: number): {
    canvas: any;
    width: number;
    height: number;
    ready: boolean;
} | null;
export declare function freeFrameSlot(id: number): void;
