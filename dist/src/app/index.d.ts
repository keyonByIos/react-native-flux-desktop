import type { ReactNode } from 'react';
import type { ValueType } from './db';
import { UserLogStore } from '../log';
export type { ValueType } from './db';
/**
 * 主题配置（系统保留命名空间 App.theme）：主 demo 右上角三个正交维度（明暗 / 紧凑 / 主色）+ 动效开关。
 * 全局唯一事实来源，所有窗口订阅同一份 → 一处改全窗刷新。
 */
export interface AppThemeConfig {
    dark: boolean;
    compact: boolean;
    primary: string;
    animation: boolean;
}
/**
 * 应用行为偏好（系统保留命名空间 App.prefs）：跨进程持久于 flux_app.kv。
 * 目前仅「退出前是否弹确认框」——供系统托盘「退出」等动作读取（true=弹框，勾选「下次不再询问」置 false → 之后直退）。
 */
export interface AppPrefs {
    confirmOnQuit: boolean;
}
/**
 * 系统保留命名空间 App 的内容：{ theme, ...(后续 APP 扩展) }。
 * 后续可在此追加 locale / timezone / 布局偏好等全局态，字段名对用户自定义存储隐藏（不可被占用）。
 */
export interface AppNamespace {
    theme: AppThemeConfig;
    prefs: AppPrefs;
}
/**
 * 系统层存储顶层结构：目前仅 `App` 命名空间（主题等系统态）。
 * 用户自定义存储不在此列 —— 走独立的 App.user（另一实体库 + 需 init 声明类型）。
 */
export interface AppConfig {
    App: AppNamespace;
}
/**
 * 系统配置总线（App.config）：管理系统保留命名空间 App（主题等），带系统内建默认值，
 * 并从实体库 flux_app.kv 回灌/落盘（整份 App 命名空间存为一条 json 记录）。所有窗口订阅同一份
 * → 一处 set 全窗同步刷新。addon 不可用时读写降级为纯内存（不影响抓帧探针）。
 */
declare class ConfigStore {
    private _data;
    private _ee;
    constructor();
    /** 从 flux_app.kv 回灌 App 命名空间：逐字段浅覆盖默认（theme/prefs 各再深一层合并默认）。 */
    private _hydrate;
    /** 把当前 App 命名空间落盘。 */
    private _persist;
    /** 全量快照（订阅回调即拿到整份系统配置，含 App 命名空间） */
    get(): AppConfig;
    /** 读系统保留命名空间 App */
    getApp(): AppNamespace;
    /** 读主题配置（App.theme 便捷访问） */
    getTheme(): AppThemeConfig;
    /** 系统内建：更新主题（浅合并进 App.theme → 落盘，全同值则不广播） */
    setTheme(patch: Partial<AppThemeConfig>): void;
    subscribe(cb: (c: AppConfig) => void): () => void;
    /** 读行为偏好（App.prefs 便捷访问） */
    getPrefs(): AppPrefs;
    /** 系统内建：更新行为偏好（浅合并进 App.prefs → 落盘，全同值则不广播） */
    setPrefs(patch: Partial<AppPrefs>): void;
}
/** 用户存储快照：init 过的键 → 当前值 */
export type UserSnapshot = Record<string, unknown>;
/**
 * 用户自定义存储（App.user）：独立实体库 flux_user.kv，与系统层物理分离。
 * 每个键必须先 init(key, type, default?) 声明「名称 + 值类型 (+ 默认)」，之后 set 才允许，
 * 且写入值必须匹配声明类型（bool/num/str/json）。落盘为带类型前缀的二进制，非明文。
 * 校验：不可占用系统保留键（App）/原型污染键；重复 init 类型须一致（幂等）。
 */
declare class UserStore {
    private _meta;
    private _data;
    private _ee;
    /** 声明用户键：名称 + 值类型 + 可选默认。幂等；持久库已有同类型值则沿用，否则落默认并写盘。 */
    init(key: string, type: ValueType, def?: unknown): void;
    /** 写值：键须已 init，且值类型匹配声明。落盘 + 广播。 */
    set(key: string, value: unknown): void;
    read<T = unknown>(key: string): T | undefined;
    /** 键的声明类型（未 init → undefined） */
    type(key: string): ValueType | undefined;
    isInit(key: string): boolean;
    /** 已 init 的键名列表 */
    keys(): string[];
    remove(key: string): void;
    snapshot(): UserSnapshot;
    subscribe(cb: (s: UserSnapshot) => void): () => void;
    private _assertKey;
}
/** 一扇已登记窗口的元信息 + host 引用（host 用 any 承载以守住 App 叶子依赖，避免 import WindowHost 造环） */
export interface WindowRecord {
    id: number;
    title: string;
    tag?: string;
    parentId?: number;
    modal: boolean;
    host: any;
}
/** 命令式开窗参数：交给 renderer 注册的工厂去挂载一扇新窗（每窗一 React 根）。 */
export interface OpenWindowOptions {
    /** 挂载到该窗内容区的 React 元素（不含 <Window> 外壳，外壳由工厂按下面尺寸/标志包） */
    content: ReactNode;
    title?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    parentId?: number;
    modal?: boolean;
    tag?: string;
    /** 顶层窗：置前且不被普通窗遮挡。缺省 = 跟随 modal（托盘菜单：modal:false + alwaysOnTop:true 得悬浮但不锁输入） */
    alwaysOnTop?: boolean;
    /** 是否允许用户拖拽缩放（缺省 true） */
    resizable?: boolean;
    /** 最小/最大内尺寸（逻辑像素，任一维可单独给） */
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    /** 是否有系统标题栏/边框（缺省 true；false = 无标题无边框） */
    decorations?: boolean;
    /** 无背景/透明能力窗（缺省 false） */
    transparent?: boolean;
    /** 建窗即最大化（缺省 false） */
    maximized?: boolean;
    /** 在主显示器居中（缺省：未给 x/y 时自动 true） */
    center?: boolean;
    /** 生命周期回调：准备加载/加载中/加载完成/关闭 */
    onPreparing?: () => void;
    onLoading?: () => void;
    onReady?: () => void;
    onClose?: () => void;
    /** 焦点变化（获焦 true / 失焦 false）：无框弹窗（托盘菜单等）据此「失焦即关」 */
    onFocused?: (focused: boolean) => void;
}
export type WindowFactory = (opts: OpenWindowOptions) => void;
declare class AppSingleton {
    /** 系统层配置总线（App 命名空间 / 主题；flux_app.kv 持久化 + 系统内建默认） */
    readonly config: ConfigStore;
    /** 用户层自定义存储（需 init 声明类型；flux_user.kv 持久化，与系统层物理分离） */
    readonly user: UserStore;
    /** 用户日志（需 init 注册通道；统一写入 user 日志，与系统日志物理分离） */
    readonly log: UserLogStore;
    /**
     * 系统托盘（原生通知区图标）：进程级唯一句柄。不挂原生菜单（原生 PopupMenu 不能适配应用主题）。
     * · create({ tooltip, iconPath? }) 建托盘；回调 onLeftClick/onDoubleClick/onRightClick(cb)（cb 收 {action, button}）。
     * · 左/双击唤主窗、右键渲染自定义主题菜单等应用级行为不在此处：上层订阅自行路由（见 gallery 接线）。
     * addon 不可用时全部方法 no-op（不影响纯 tsc/单测/非原生环境）。事件由原生 pump() 同一条泵回抛。
     */
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
    /** renderer 启动时注入开窗工厂（打破 App↔renderer 循环） */
    __setWindowFactory(f: WindowFactory): void;
    /** 由 WindowHost 建窗时调用：登记 + 若 modal 则入模态栈 */
    register(rec: WindowRecord): void;
    /** 由 WindowHost 关窗时调用：摘登记 + 出模态栈 */
    unregister(id: number): void;
    windows(): WindowRecord[];
    get(id: number): WindowRecord | undefined;
    findByTag(tag: string): WindowRecord | undefined;
    /** 最先打开的窗（通常 = 主窗） */
    main(): WindowRecord | undefined;
    /**
     * 唤醒并前置主窗（从最小化恢复 + 抢前台焦点）。
     * 供单实例「打包后重复打开 → 唤起老 App」的次实例回调调用：
     *   onSecondInstance(() => Application.wakeMainWindow())。
     * 无窗 / host 不支持 focus 时静默降级（不影响运行）。
     */
    wakeMainWindow(): void;
    /**
     * 主窗当前 DPI 缩放因子（托盘物理坐标→逻辑坐标换算用）。
     * 托盘事件回抛的 rect 是物理像素，而 Window 的 x/y 走逻辑像素：
     * 弹托盘菜单前除以本值（取自主窗所在显示器，与任务区同屏）。
     * 无主窗 / host 未就绪时回落 1（不致崩，坐标在 100% 缩放下仍正确）。
     */
    getMainWindowScale(): number;
    /** 命令式开一扇新窗（转交 renderer 工厂；host 建好后自登记，id 届时可知） */
    open(opts: OpenWindowOptions): void;
    /** 按 id 关窗（调 host.close → Rust 隐藏摘除 + 本地退泵/计数） */
    close(id: number): void;
    /** 按 tag 关窗（demo 的「关闭设置」用）；返回是否命中 */
    closeTag(tag: string): boolean;
    /** 当前模态栈顶（无模态窗 = undefined） */
    topModal(): number | undefined;
    /** 输入门：存在活动模态窗且本窗非栈顶 → 拦截本窗一切交互 */
    shouldBlockInput(id: number): boolean;
}
/** 全局唯一实例 */
export declare const Application: AppSingleton;
