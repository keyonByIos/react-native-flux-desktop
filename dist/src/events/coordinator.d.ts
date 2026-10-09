/** 窗口绝对坐标下的矩形 */
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface OverlayEntry {
    /** 该浮层占据的绝对矩形（触发器框 + 面板框）；命中任一即视为点在浮层内 */
    rects: Rect[];
    /** 请求关闭（宿主判定点在矩形外时调用） */
    close: () => void;
}
/** 登记一个打开的浮层；返回注销函数。rects 数组可被调用方原地更新（引用不变即可）。 */
export declare function registerOverlay(entry: OverlayEntry): () => void;
/**
 * 宿主在每次「抬起即点击」时广播窗口绝对坐标。
 * 关闭所有矩形都不包含该点的浮层（即点击落在其外部）。
 * 先快照再遍历，允许 close() 内部注销自己。
 */
export declare function handleGlobalPress(x: number, y: number): void;
/** 主动关闭全部浮层（如切换页面/主题时用）。 */
export declare function closeAllOverlays(): void;
