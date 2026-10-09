/** 原生托盘是否可用（addon 载入且导出 createTray）。不可用时所有操作 no-op（纯 tsc/单测/非原生环境）。 */
export declare const available: boolean;
/** 托盘图标在屏幕上的物理矩形（原生回抛，未除以 scale）；某些 Linux 后端不提供时为 undefined。 */
export interface TrayRect {
    x: number;
    y: number;
    w: number;
    h: number;
}
/** 托盘事件（drain_tray_events 回抛的 JSON 解析结果）。仅三种交互：左键单击 / 左键双击 / 右键单击。 */
export type TrayEvent = {
    type: 'tray';
    action: 'click';
    button: 'left';
    rect?: TrayRect;
} | {
    type: 'tray';
    action: 'double-click';
    button: 'left';
    rect?: TrayRect;
} | {
    type: 'tray';
    action: 'right-click';
    button: 'right';
    rect?: TrayRect;
};
export interface TrayOptions {
    /** 悬浮提示文本 */
    tooltip?: string;
    /** 图标 PNG 绝对路径；缺省回落 process.env.FLUX_ICON，仍无则画一个占位圆角方块 */
    iconPath?: string;
    /** 图标边长（逻辑像素，默认 24） */
    iconSize?: number;
}
/** 托盘单例门面（进程级唯一：一个托盘句柄）。 */
export declare const tray: {
    available: boolean;
    /** 是否已建托盘 */
    isCreated(): boolean;
    /** 建托盘（异步解码图标）。addon 不可用即 no-op。已存在则先摘再建。 */
    create(opts: TrayOptions): void;
    /** 换图标（PNG 路径同 create 规则）。 */
    setIcon(iconPath?: string, size?: number): void;
    /** 换悬浮提示。 */
    setTooltip(text: string): void;
    /** 摘除托盘并停回抛。 */
    remove(): void;
    /** 订阅某类事件：action ∈ click|double-click|right-click；或 'event' 收全部。返回退订。 */
    on(action: string, cb: (ev: TrayEvent) => void): () => void;
    /** 左键单击托盘图标 */
    onLeftClick(cb: (ev: TrayEvent) => void): () => void;
    /** 左键双击托盘图标 */
    onDoubleClick(cb: (ev: TrayEvent) => void): () => void;
    /** 右键单击托盘图标（用于渲染自定义主题菜单） */
    onRightClick(cb: (ev: TrayEvent) => void): () => void;
    /**
     * 装填「点外面即关」监听（与 OS 焦点无关，专治置顶菜单点桌面/其它窗不关）。
     * rect：菜单在屏幕上的**物理**矩形（上层把逻辑坐标 × scale 得到）；
     * cb：当全局光标落在 rect 之外且任一键按下时触发一次（原生随即自动解除，一次性）。
     * addon 不可用（非 Windows / 纯 tsc）时 no-op。
     */
    armDismiss(rect: TrayRect, cb: () => void): void;
    /** 解除「点外面即关」监听（菜单经选中项/失焦等正常关闭时调用，幂等）。 */
    disarmDismiss(): void;
};
