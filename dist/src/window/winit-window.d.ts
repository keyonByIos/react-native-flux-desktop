import type { PlatformWindow } from './platform';
export interface WinitWindowOptions {
    width: number;
    height: number;
    title?: string;
    /** 有效光栅倍率（0 或缺省 = 跟随原生 scale）。host 自己算 dpr 封顶，通常留 0 */
    renderScale?: number;
    /** 可选逻辑坐标（缺省由 OS 层叠摆放）。子窗/级联窗用于错位 */
    x?: number;
    y?: number;
    /** 顶层窗（模态/子窗）：置前且不被普通主窗遮挡 */
    onTop?: boolean;
    /** 是否允许用户拖拽缩放（缺省 true = 跟随系统默认可缩放） */
    resizable?: boolean;
    /** 最小内尺寸（逻辑像素，任一维可单独给） */
    minWidth?: number;
    minHeight?: number;
    /** 最大内尺寸（逻辑像素，任一维可单独给） */
    maxWidth?: number;
    maxHeight?: number;
    /** 是否有系统标题栏/边框（缺省 true；false = 无标题无边框） */
    decorations?: boolean;
    /** 透明能力窗（缺省 false；当前软栅格无 alpha 穿透，未绘制区暂黑） */
    transparent?: boolean;
    /** 建窗即最大化（缺省 false） */
    maximized?: boolean;
    /** 建窗后在主显示器居中（缺省 false）。host 默认：未显式给 x/y 时置真，让主窗/对话框默认屏幕中心 */
    center?: boolean;
}
type Handler = (payload: any) => void;
export declare class WinitWindow implements PlatformWindow {
    private _listeners;
    /** 本窗在 Rust 侧的自增 id（present/setCursor/setTitle 均按此路由）。createWindow 同步返回 */
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
    /** 有效光栅倍率：renderScale 显式设定则用之（封顶 4），否则跟随原生 scale */
    private _renderScale;
    /** 出画布尺寸（逻辑×renderScale），供上层建 canvas */
    renderSize(): {
        w: number;
        h: number;
        renderScale: number;
        logicalW: number;
        logicalH: number;
    };
    /** 上次 present 的 data() 读回耗时（ms，诊断用：host 的 [frame] 日志据此拆 blit 大头） */
    lastDataMs: number;
    /** 上次 present 的 Rust 贴屏（RGBA 转换 + GDI）耗时（ms，诊断用） */
    lastPasteMs: number;
    /** 贴一帧：收 @napi-rs/canvas 的 canvas（或 {data,width,height}），底层缩放铺到物理 */
    present(canvas: any): void;
    setCursor(shape: string): void;
    /** 运行时设/取消用户拖拽缩放 */
    setResizable(v: boolean): void;
    /** 当前是否可缩放（native 未就绪时按默认可缩放 true） */
    isResizable(): boolean;
    /** 设最小内尺寸（逻辑像素）：传 null/undefined 该维不设，两者都空 = 清除 */
    setMinSize(w?: number | null, h?: number | null): void;
    /** 设最大内尺寸（逻辑像素）：传 null/undefined 该维不设，两者都空 = 清除 */
    setMaxSize(w?: number | null, h?: number | null): void;
    /** 以逻辑像素设定窗口内尺寸 */
    setSize(w: number, h: number): void;
    /** 当前内尺寸（逻辑像素）：native 未就绪返回 {0,0} */
    innerSize(): {
        w: number;
        h: number;
    };
    /** 运行时设/取消标题栏与边框 */
    setDecorations(v: boolean): void;
    /** 当前是否有标题栏/边框（无窗兜底 true） */
    isDecorated(): boolean;
    /** 最大化 / 还原 */
    setMaximized(v: boolean): void;
    /** 当前是否最大化 */
    isMaximized(): boolean;
    /** 最小化 / 从最小化恢复 */
    setMinimized(v: boolean): void;
    /** 唤醒并前置本窗：从最小化恢复 + 抢前台焦点（native focus_window） */
    focusWindow(): void;
    /** 运行时把本窗在主显示器居中 */
    center(): void;
    /** 以逻辑坐标移动本窗到 (x, y)（外框左上角） */
    setPosition(x: number, y: number): void;
    /** 本窗所在主显示器尺寸与原点（逻辑像素）：native 未就绪返回全 0 */
    monitorSize(): {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /** 本窗外框左上角当前坐标（逻辑像素）：native 未就绪返回 {0,0} */
    getPosition(): {
        x: number;
        y: number;
    };
    setTitle(t: string): void;
    /** 同步背景色：hex 解为 RGB 后交给 native 存入 Entry.bg（拖动缩放时填充露出区域）。native 未就绪则静默降级。 */
    setBackground(hex: string): void;
    get scaleFactor(): number;
    /** 启动全局事件泵（共享唯一一条定时器）；onFrame/fps 仅为兼容旧签名，帧实际由上层 scheduleFrame 驱动 */
    run(_onFrame?: (win: WinitWindow) => void, _fps?: number): this;
    private _shutdown;
    /** 主动关闭：请求 Rust 隐藏+摘除本窗（set_visible(false) + drop Surface），再走本地关窗流程。
     *  注意：Rust 侧窗口是 leak 的，HWND 真正销毁依赖末窗退进程。 */
    close(): void;
}
export {};
