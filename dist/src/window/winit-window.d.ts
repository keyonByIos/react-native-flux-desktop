import type { PlatformWindow } from './platform';
export interface WinitWindowOptions {
    width: number;
    height: number;
    title?: string;

    renderScale?: number;

    x?: number;
    y?: number;

    onTop?: boolean;

    resizable?: boolean;

    minWidth?: number;
    minHeight?: number;

    maxWidth?: number;
    maxHeight?: number;

    decorations?: boolean;

    transparent?: boolean;

    maximized?: boolean;

    center?: boolean;
}
type Handler = (payload: any) => void;
export declare class WinitWindow implements PlatformWindow {
    private _listeners;

    readonly id: number;
    physW: number;
    physH: number;
    scale: number;
    renderScale: number;
    private _lastLogical;
    private _stopped;
    private _closed;
    private _frames;
    constructor(opts: WinitWindowOptions);
    on(type: string, cb: Handler): this;
    private _emit;
    private _onRaw;
    private _normalize;

    private _renderScale;

    renderSize(): {
        w: number;
        h: number;
        renderScale: number;
        logicalW: number;
        logicalH: number;
    };

    lastDataMs: number;

    lastPasteMs: number;

    present(canvas: any): void;
    setCursor(shape: string): void;

    setResizable(v: boolean): void;

    isResizable(): boolean;

    setMinSize(w?: number | null, h?: number | null): void;

    setMaxSize(w?: number | null, h?: number | null): void;

    setSize(w: number, h: number): void;

    innerSize(): {
        w: number;
        h: number;
    };

    setDecorations(v: boolean): void;

    isDecorated(): boolean;

    setMaximized(v: boolean): void;

    isMaximized(): boolean;

    setMinimized(v: boolean): void;

    focusWindow(): void;

    center(): void;

    setPosition(x: number, y: number): void;

    monitorSize(): {
        x: number;
        y: number;
        w: number;
        h: number;
    };

    getPosition(): {
        x: number;
        y: number;
    };
    setTitle(t: string): void;

    setBackground(hex: string): void;
    get scaleFactor(): number;

    run(_onFrame?: (win: WinitWindow) => void, _fps?: number): this;
    private _shutdown;

    close(): void;
}
export {};
