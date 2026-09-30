export interface SelRect {
    x: number;
    y: number;
    w: number;
    h: number;
}
interface TextSelState {
    visible: boolean;
    rects: SelRect[];
    text: string;
}
/** 选中一批行矩形（窗口逻辑坐标），携带其完整文本供复制 */
export declare function showTextSelection(rects: SelRect[], text: string): void;
export declare function clearTextSelection(): void;
export declare function getTextSelectionState(): TextSelState;
export declare function subscribeTextSelection(l: () => void): () => void;
export {};
