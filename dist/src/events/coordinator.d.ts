
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface OverlayEntry {

    rects: Rect[];

    close: () => void;
}

export declare function registerOverlay(entry: OverlayEntry): () => void;

export declare function handleGlobalPress(x: number, y: number): void;

export declare function closeAllOverlays(): void;
