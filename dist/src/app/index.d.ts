import type { ReactNode } from 'react';
import type { ValueType } from './db';
import { UserLogStore } from '../log';
export type { ValueType } from './db';

export interface AppThemeConfig {
    dark: boolean;
    compact: boolean;
    primary: string;
    animation: boolean;

    fontSize?: number;

    controlHeight?: number;
}

export interface AppPrefs {
    confirmOnQuit: boolean;
}

export interface AppNamespace {
    theme: AppThemeConfig;
    prefs: AppPrefs;
}

export interface AppConfig {
    App: AppNamespace;
}

declare class ConfigStore {
    private _data;
    private _ee;
    constructor();

    private _hydrate;

    private _persist;

    get(): AppConfig;

    getApp(): AppNamespace;

    getTheme(): AppThemeConfig;

    setTheme(patch: Partial<AppThemeConfig>): void;
    subscribe(cb: (c: AppConfig) => void): () => void;

    getPrefs(): AppPrefs;

    setPrefs(patch: Partial<AppPrefs>): void;
}

export type UserSnapshot = Record<string, unknown>;

declare class UserStore {
    private _meta;
    private _data;
    private _ee;
    constructor();

    init(key: string, type: ValueType, def?: unknown): void;

    set(key: string, value: unknown): void;
    read<T = unknown>(key: string): T | undefined;

    type(key: string): ValueType | undefined;
    isInit(key: string): boolean;

    keys(): string[];
    remove(key: string): void;
    snapshot(): UserSnapshot;
    subscribe(cb: (s: UserSnapshot) => void): () => void;
    private _assertKey;
}

export interface WindowRecord {
    id: number;
    title: string;
    tag?: string;
    parentId?: number;
    modal: boolean;
    host: any;
}

export interface OpenWindowOptions {

    content: ReactNode;
    title?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    parentId?: number;
    modal?: boolean;
    tag?: string;

    alwaysOnTop?: boolean;

    resizable?: boolean;

    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;

    decorations?: boolean;

    transparent?: boolean;

    maximized?: boolean;

    center?: boolean;

    onPreparing?: () => void;
    onLoading?: () => void;
    onReady?: () => void;
    onClose?: () => void;

    onFocused?: (focused: boolean) => void;
}
export type WindowFactory = (opts: OpenWindowOptions) => void;
declare class AppSingleton {

    readonly config: ConfigStore;

    readonly user: UserStore;

    readonly log: UserLogStore;

    readonly tray: {
        available: boolean;
        isCreated(): boolean;
        create(opts: import("./tray").TrayOptions): void;
        setIcon(iconPath?: string, size?: number): void;
        setTooltip(text: string): void;
        remove(): void;
        on(action: string, cb: (ev: import("./tray").TrayEvent) => void): () => void;
        onLeftClick(cb: (ev: import("./tray").TrayEvent) => void): () => void;
        onDoubleClick(cb: (ev: import("./tray").TrayEvent) => void): () => void;
        onRightClick(cb: (ev: import("./tray").TrayEvent) => void): () => void;
        armDismiss(rect: import("./tray").TrayRect, cb: () => void): void;
        disarmDismiss(): void;
    };
    private _windows;
    private _order;
    private _modalStack;
    private _factory;

    __setWindowFactory(f: WindowFactory): void;

    register(rec: WindowRecord): void;

    unregister(id: number): void;
    windows(): WindowRecord[];
    get(id: number): WindowRecord | undefined;
    findByTag(tag: string): WindowRecord | undefined;

    main(): WindowRecord | undefined;

    getFps(windowId?: number): number;

    fpsSnapshot(): {
        id: number;
        title: string;
        fps: number;
    }[];

    wakeMainWindow(): void;

    getMainWindowScale(): number;

    open(opts: OpenWindowOptions): void;

    close(id: number): void;

    closeTag(tag: string): boolean;

    topModal(): number | undefined;

    shouldBlockInput(id: number): boolean;
}

export declare const Application: AppSingleton;
