export interface CtxItem {
    label: string;

    disabled?: boolean;

    divider?: boolean;
    onClick: () => void;
}
interface MenuState {
    visible: boolean;
    x: number;
    y: number;
    items: CtxItem[];
}

export declare function showContextMenu(x: number, y: number, items: CtxItem[]): void;

export declare function hideContextMenu(): void;
export declare function getContextMenuState(): MenuState;
export declare function subscribeContextMenu(l: () => void): () => void;
export {};
