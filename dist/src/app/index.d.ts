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
    /** 基础字号覆盖（SeedToken.fontSize）；缺省 = 跟随密度算法（宽松 13 / 紧凑 12） */
    fontSize?: number;
    /** 控件高度覆盖（SeedToken.controlHeight）；缺省 = 跟随密度算法（宽松 30 / 紧凑 26） */
    controlHeight?: number;
}
/**
 * 应用行为偏好（系统保留命名空间 App.prefs）：跨进程持久于 flux_app.kv。
 * · confirmOnQuit：退出前是否弹确认框（供托盘「退出」读取，true=弹框，勾选「下次不再询问」置 false → 之后直退）。
 * · renderer：渲染后端。'gpu'=GPU 直呈（更流畅，内存 +~100MB）；'cpu'=CPU 光栅（省内存）。缺省 'cpu'。
 *   该偏好在建窗时读一次决定 renderFrame 走哪条路 → 切换后需重启应用才生效（见 Application.setRenderer / relaunch）。
 *   env FLUX_GPU 可在运行期覆盖本偏好（'1' 强开 / '0' 强关，供调试/A-B/抓帧），优先级高于此持久值。
 * · resolution：光栅倍率（dpr）封顶，清晰度 ↔ 性能的权衡。存百分整数：0=跟随原生 scale（缺省），100/150/200=把 dpr 封顶到 1.0/1.5/2.0。
 *   帧成本（尤其 present 整幅读回）∝ dpr²，压低分辨率即省算力/降帧时但牺牲清晰度。可热切换（见 Application.setResolution，靠 faces 重建守卫下帧生效）。
 *   优先级：本偏好（非 0）> env FLUX_MAX_DPR > 跟随原生。⚠ 低于原生 scale 封顶会触发最近邻上采样 → 边缘轻锯齿（分数倍时更明显）。
 */
export interface AppPrefs {
    confirmOnQuit: boolean;
    renderer: 'gpu' | 'cpu';
    resolution: number;
    /** 全局正文字体族别名（缺省 undefined=跟随 app.json defaultFont / 内置）；需该别名在 app.json fonts 声明并注册成功才生效。切换需重启，见 Application.setFont */
    font?: string;
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
    constructor();
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
     * 对外接口：取某扇窗当前帧率（每秒实际上屏帧数）。
     * 缺省 windowId = 主窗；传 id 取指定窗。拿不到窗/host 返 0。
     * FPS 来自 host.getFps()：基于「实际上屏帧」的 ~0.5s 滚动窗口，空闲（>1s 无新帧）返 0。
     */
    getFps(windowId?: number): number;
    /** 逐窗帧率快照（供监控面板）：按打开顺序返回 [{ id, title, fps }]。 */
    fpsSnapshot(): {
        id: number;
        title: string;
        fps: number;
    }[];
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
    /**
     * 重启整个应用进程：脱离当前进程树重拉一个新实例，再退出本进程。
     * 供「需重启才生效」的切换使用（如顶栏渲染模式 GPU↔CPU：写偏好后调用本方法，新进程读持久化偏好落地）。
     * · 子进程 env 删除 FLUX_GPU：让持久化偏好 App.prefs.renderer 作主，而非继承本次会话的调试覆盖。
     * · 子进程 env 置 FLUX_RELAUNCH=1：dev 入口（dev-runner.js）据此跳过父进程看门狗（否则新实例会被自己掉死）。
     * · spawn 前先 releaseSingleInstance()：主动交还单实例锁，避免子进程抢锁失败退为「次实例」（仅打包环境有锁）。
     */
    relaunch(): void;
    /**
     * 切换渲染后端（GPU 直呈 ↔ CPU 光栅）：写持久化偏好 App.prefs.renderer 后重启进程生效。
     * GPU 上下文在 native 建窗那一刻绑定，无法热切，故本接口 = setPrefs + relaunch（新进程读偏好落地）。
     * 供顶栏「流畅 GPU / 省内存 CPU」按钮直调。
     */
    setRenderer(v: 'gpu' | 'cpu'): void;
    /**
     * 切换光栅分辨率（dpr 封顶）：写持久化偏好 App.prefs.resolution 后排一帧即时生效（无需重启）。
     * pct：0=跟随原生 scale，100/150/200=封顶 dpr 1.0/1.5/2.0。host.dpr() 每帧现算，改后下一帧
     *   renderFrame 命中 faces 重建守卫（f0.dpr!==dpr）自动按新倍率重建 → 热切换。scheduleFrame 全局排帧。
     */
    setResolution(pct: number): void;
    /**
     * 切换全局正文字体（写持久化偏好 App.prefs.font 后重启进程生效）。
     * 字体在 bootstrap 首帧前一次性注册（registerFonts），且全局默认族影响所有不写 fontFamily 的组件的
     *   布局测量——运行中改族会让已提交的 Yoga 旧宽高不刷新，故与 renderer 同范式：setPrefs + relaunch，
     *   新进程启动时按本偏好注入 env FLUX_DEFAULT_FAMILY 落地。family 传空串=清除偏好、回落 app.json defaultFont/内置。
     * 供「字体」demo 的全局档按钮直调（局部字体仍用 style.fontFamily 即时生效，不经此接口）。
     */
    setFont(family: string): void;
    /** 当前模态栈顶（无模态窗 = undefined） */
    topModal(): number | undefined;
    /** 输入门：存在活动模态窗且本窗非栈顶 → 拦截本窗一切交互 */
    shouldBlockInput(id: number): boolean;
}
/** 全局唯一实例 */
export declare const Application: AppSingleton;
