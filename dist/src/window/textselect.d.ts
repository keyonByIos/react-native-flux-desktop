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

export declare function showTextSelection(rects: SelRect[], text: string): void;
export declare function clearTextSelection(): void;
export declare function getTextSelectionState(): TextSelState;
export declare function subscribeTextSelection(l: () => void): () => void;
export {};
