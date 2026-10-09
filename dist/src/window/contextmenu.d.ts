export interface CtxItem {
    label: string;
    /** 置灰不可点（如无选区时的复制/剪切） */
    disabled?: boolean;
    /** 在本项上方画一条分组分隔线 */
    divider?: boolean;
    onClick: () => void;
}
interface MenuState {
    visible: boolean;
    x: number;
    y: number;
    items: CtxItem[];
}
/** 在窗口逻辑坐标 (x,y) 弹出菜单 */
export declare function showContextMenu(x: number, y: number, items: CtxItem[]): void;
/** 关闭菜单 */
export declare function hideContextMenu(): void;
export declare function getContextMenuState(): MenuState;
export declare function subscribeContextMenu(l: () => void): () => void;
export {};
