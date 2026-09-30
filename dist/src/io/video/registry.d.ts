/** 为一个 videoId 建槽（解码尺寸确定后调用一次；seek 不改尺寸，无需重建） */
export declare function allocFrameSlot(id: number, width: number, height: number): void;
/** 写入一帧 RGBA（长度须 = width*height*4）；复用 imgData，避免每帧新建 */
export declare function setFrame(id: number, rgba: Buffer): void;
/** painter 每帧读取：返回当前槽（含 canvas/dims/ready），无则 null */
export declare function peekFrame(id: number): {
    canvas: any;
    width: number;
    height: number;
    ready: boolean;
} | null;
export declare function freeFrameSlot(id: number): void;
