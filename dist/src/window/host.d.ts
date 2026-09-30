import { SceneNode } from '../scene/node';
import type { PlatformWindow } from './platform';
export declare class WindowHost {
    readonly root: SceneNode;
    private win;
    private unregister;
    private pressed;
    private hovered;

    private mouseDown;
    private dragEd;

    private pendingDrag;

    private lpTimer;
    private lpNode;
    private lpStart;
    private lastSize;

    private _gpuMode;
    private _gpuCtx;

    private faces;

    private lastShownIdx;

    private facesOutOfSync;

    private shownCanvas;

    private surface;

    private lastEpoch;

    private lastLayoutEpoch;

    private prevScrolls;

    private extDirty;

    private _scrollSig;

    private lastImageGen;

    private _dbgN;

    private _memTimer;
    private _lastDbgN;

    private _moveT;

    private hoverVisual;

    private blitSkip;

    private coexistRects;

    private coexistFrame;

    __blitFrames: number;
    __fullFrames: number;
    __coexistHits: number;

    __layoutRuns: number;
    __frameCount: number;
    private _ready;
    private _logicalW;
    private _logicalH;
    private _nativeScale;
    private _destroyed;

    private unsubscribeTheme;

    private _cbs;

    private _readyFired;

    private _fire;
    constructor(root: SceneNode, win?: PlatformWindow);

    private dpr;

    private windowId;

    getMemStats(): {
        w: number;
        h: number;
        dpr: number;
        faces: number;
        surfaceMB: number;
        nodes: number;
    };

    private inputBlocked;
    private bindEvents;

    private onKey;

    private onIme;
    private onPress;

    private onContextMenu;

    private clampMenuPos;

    private findSelectable;

    private presentSelection;

    private selectionRects;
    private startLongPress;
    private cancelLongPress;
    private onRelease;
    private onMouseMove;
    private onMouseLeaveWindow;
    private onWheel;

    private usesHoverStyle;
    setCursor(shape: string): void;

    grab(path: string): void;

    findNode(id: number): SceneNode | null;

    snapshotNode(node: SceneNode): Buffer | null;

    private layoutRects;
    private layoutAbsRects;
    private dispatchOnLayout;

    private planScrollBlit;

    private paintScrollBlit;

    private _prevFrameEnd;
    private _fps;
    private _fpsSecFrames;
    private _fpsSecStart;

    private _notePresented;

    getFps(): number;

    private computeScrollSig;
    renderFrame(): void;

    private onWindowClosed;

    setResizable(v: boolean): void;

    isResizable(): boolean;

    setMinSize(w?: number | null, h?: number | null): void;

    setMaxSize(w?: number | null, h?: number | null): void;

    setSize(w: number, h: number): void;

    setDecorations(v: boolean): void;

    isDecorated(): boolean;

    setMaximized(v: boolean): void;

    maximize(): void;

    restore(): void;

    isMaximized(): boolean;

    setMinimized(v: boolean): void;

    minimize(): void;

    focus(): void;

    center(): void;

    setPosition(x: number, y: number): void;

    getMonitorSize(): {
        x: number;
        y: number;
        w: number;
        h: number;
    };

    getScale(): number;

    getWindowState(): {
        resizable: boolean;
        maximized: boolean;
        decorated: boolean;
        x: number;
        y: number;
        w: number;
        h: number;
    };
    close(): void;
}
