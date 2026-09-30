/** 鼠标键：无损区分主/次/中/前进/后退/其它侧键（other-N 带原始码） */
export type PointerButton = 'left' | 'right' | 'middle' | 'back' | 'forward' | 'other' | string;
/** 滚轮增量单位：line=按行（需上层按每行像素折算），pixel=已是像素 */
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
    /** 键名：可打印字符本身（"a"/"7"/","），命名键用底座 Debug 名（"Enter"/"Backspace"/"ArrowLeft"…） */
    key: string;
    /** 长按连发（原生标记，可缺省） */
    repeat?: boolean;
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
}
/** IME 输入法组合事件：preedit=正在拼（下划线候选），commit=已上屏，enabled/disabled=会话开关 */
export interface ImeInfo {
    action: 'preedit' | 'commit' | 'enabled' | 'disabled';
    /** 组合/提交文本（enabled/disabled 时为空串） */
    text: string;
    /** preedit 光标在 text 内的插入位置（字符索引），部分平台缺省 */
    caret?: number;
}
export interface FocusInfo {
    focused: boolean;
}
/** 文件拖放：enter=拖入悬停、over=持续悬停（可选）、leave=移出/取消、drop=已放下（携路径） */
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
/** 事件名 → 载荷类型 */
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
    /** 本窗在平台层的唯一 id（底座侧为自增 u32）。供上层按窗路由输入/模态门；抽象 stub/测试 mock 可缺省 */
    readonly id?: number;
    /** 订阅事件；close 在窗口销毁/进程退出前派发 */
    on<K extends PlatformWindowEvent>(type: K, cb: (payload: PlatformWindowEventMap[K]) => void): this;
    on(type: string, cb: (payload: any) => void): this;
    /** 当前出画布尺寸（逻辑×有效倍率），供上层建 canvas */
    renderSize(): RenderSize;
    /** 贴一帧：收 @napi-rs/canvas 画布（或 {data,width,height}），实现层缩放铺到物理 */
    present(canvas: any): void;
    /** 设光标形状：字符串直喂底层（"pointer"/"text"/"default"/... 见 cursor_icon） */
    setCursor(shape: string): void;
    setTitle(title: string): void;
    /** 运行时设/取消用户拖拽缩放（实现层可选支持：底座支持；stub/mock 可缺省）。 */
    setResizable?(v: boolean): void;
    /** 当前是否可缩放（缺省按可缩放 true）。 */
    isResizable?(): boolean;
    /** 设最小内尺寸（逻辑像素）：任一维传 null/undefined 表示该维不设，两者都空 = 清除。 */
    setMinSize?(w?: number | null, h?: number | null): void;
    /** 设最大内尺寸（逻辑像素）：语义同 setMinSize。 */
    setMaxSize?(w?: number | null, h?: number | null): void;
    /** 以逻辑像素设定窗口内尺寸。 */
    setSize?(w: number, h: number): void;
    /** 当前内尺寸（逻辑像素）。 */
    innerSize?(): {
        w: number;
        h: number;
    };
    /** 运行时设/取消标题栏与边框（false = 无标题无边框）。 */
    setDecorations?(v: boolean): void;
    /** 当前是否有标题栏/边框（缺省按 true）。 */
    isDecorated?(): boolean;
    /** 最大化 / 还原。 */
    setMaximized?(v: boolean): void;
    /** 当前是否最大化（缺省按 false）。 */
    isMaximized?(): boolean;
    /** 最小化 / 从最小化恢复。 */
    setMinimized?(v: boolean): void;
    /** 唤醒并前置本窗：从最小化恢复 + 抢前台焦点（实现层可选支持）。 */
    focusWindow?(): void;
    /** 运行时把窗口在主显示器居中（实现层可选支持）。 */
    center?(): void;
    /** 以逻辑坐标移动窗口到 (x, y)（外框左上角）。 */
    setPosition?(x: number, y: number): void;
    /** 主显示器尺寸与原点（逻辑像素）。 */
    monitorSize?(): {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /** 窗口外框左上角当前坐标（逻辑像素）。 */
    getPosition?(): {
        x: number;
        y: number;
    };
    /** 同步窗口背景色（hex，如 "#141414"/"#ffffff"）：拖动缩放时填充旧帧未覆盖的露出区域，避免黑底割裂。
     *  由实现层可选支持（底座支持；抽象 stub/mock 可缺省）。 */
    setBackground?(hex: string): void;
    /** 原生 devicePixelRatio（未封顶） */
    readonly scaleFactor: number;
    /** 启动主循环泵帧；onFrame 每拍回调（可省略，帧由上层 scheduleFrame 驱动） */
    run(onFrame?: (win: any) => void, fps?: number): this;
    /** 主动关闭 */
    close(): void;
}
