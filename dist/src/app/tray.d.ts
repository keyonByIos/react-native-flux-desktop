
export declare const available: boolean;

export interface TrayRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

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

    tooltip?: string;

    iconPath?: string;

    iconSize?: number;
}

export declare const tray: {
    available: boolean;

    isCreated(): boolean;

    create(opts: TrayOptions): void;

    setIcon(iconPath?: string, size?: number): void;

    setTooltip(text: string): void;

    remove(): void;

    on(action: string, cb: (ev: TrayEvent) => void): () => void;

    onLeftClick(cb: (ev: TrayEvent) => void): () => void;

    onDoubleClick(cb: (ev: TrayEvent) => void): () => void;

    onRightClick(cb: (ev: TrayEvent) => void): () => void;

    armDismiss(rect: TrayRect, cb: () => void): void;

    disarmDismiss(): void;
};
