
export type PointerButton = 'left' | 'right' | 'middle' | 'back' | 'forward' | 'other' | string;

export type WheelMode = 'line' | 'pixel';
export interface ResizeInfo {
    logicalW: number;
    logicalH: number;
    physW: number;
    physH: number;
    scale: number;
    renderW: number;
    renderH: number;
    renderScale: number;
}
export interface MouseMoveInfo {
    x: number;
    y: number;
}
export interface MouseInfo {
    action: 'down' | 'up';
    x: number;
    y: number;
    button: PointerButton;
}
export interface WheelInfo {
    dx: number;
    dy: number;
    mode: WheelMode;
    x: number;
    y: number;
}
export interface KeyInfo {
    down: boolean;

    key: string;

    repeat?: boolean;
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
}

export interface ImeInfo {
    action: 'preedit' | 'commit' | 'enabled' | 'disabled';

    text: string;

    caret?: number;
}
export interface FocusInfo {
    focused: boolean;
}

export interface DropInfo {
    action: 'enter' | 'over' | 'leave' | 'drop';
    path: string;
}
export interface RenderSize {
    w: number;
    h: number;
    renderScale: number;
    logicalW: number;
    logicalH: number;
}

export interface PlatformWindowEventMap {
    resize: ResizeInfo;
    mousemove: MouseMoveInfo;
    mouse: MouseInfo;
    wheel: WheelInfo;
    key: KeyInfo;
    ime: ImeInfo;
    focus: FocusInfo;
    drop: DropInfo;
    mouseleave: Record<string, never>;
    close: {
        frames: number;
    };
}
export type PlatformWindowEvent = keyof PlatformWindowEventMap;
export interface PlatformWindow {

    readonly id?: number;

    on<K extends PlatformWindowEvent>(type: K, cb: (payload: PlatformWindowEventMap[K]) => void): this;
    on(type: string, cb: (payload: any) => void): this;

    renderSize(): RenderSize;

    present(canvas: any): void;

    setCursor(shape: string): void;
    setTitle(title: string): void;

    setResizable?(v: boolean): void;

    isResizable?(): boolean;

    setMinSize?(w?: number | null, h?: number | null): void;

    setMaxSize?(w?: number | null, h?: number | null): void;

    setSize?(w: number, h: number): void;

    innerSize?(): {
        w: number;
        h: number;
    };

    setDecorations?(v: boolean): void;

    isDecorated?(): boolean;

    setMaximized?(v: boolean): void;

    isMaximized?(): boolean;

    setMinimized?(v: boolean): void;

    focusWindow?(): void;

    center?(): void;

    setPosition?(x: number, y: number): void;

    monitorSize?(): {
        x: number;
        y: number;
        w: number;
        h: number;
    };

    getPosition?(): {
        x: number;
        y: number;
    };

    setBackground?(hex: string): void;

    readonly scaleFactor: number;

    run(onFrame?: (win: any) => void, fps?: number): this;

    close(): void;
}
