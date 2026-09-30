"use strict";
// Application —— 全局单例：在任何地方（React 内外皆可）import { Application } 调用的窗口/配置中枢。
//
// 三件事（对应多窗口诉求）：
//  1) 窗口注册表：每扇 WindowHost 建窗时自登记（含 platform id + host 引用），Application 统一增删查。
//  2) 全局配置 store（两份物理分离 + 各自实体文件，非明文二进制，进程重启回灌上次配置）：
//     · Application.config = 系统层（flux_app.kv）：管理系统保留命名空间 App（主题等），带系统内建默认，无需 init。
//     · Application.user   = 用户层（flux_user.kv）：自定义键，需先 init(key, 值类型, 默认?) 声明，写入受类型/保留键校验。
//     所有窗口订阅同一份 → 一处 set 全窗同步刷新。
//  3) 模态栈 + 输入门：modal 窗入栈，host 在其输入入口查 shouldBlockInput(id)——
//     存在活动模态窗且本窗非栈顶 → 吞掉输入（主窗变「只读」，设置窗不关则主窗不可操作）。纯 JS、跨平台一致。
//
// 依赖纪律：本模块是叶子，绝不 import renderer / window/host（防循环）。开窗由 renderer
//   通过 __setWindowFactory 注入工厂；host 只 import 本单例做登记/门控。
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const events_1 = require("events");
const db = __importStar(require("./db"));
const tray_1 = require("./tray");
const log_1 = require("../log");
/** 系统默认主题（App 层内建默认，无需 init）：持久库缺字段时回落到此。 */
const DEFAULT_THEME = { dark: true, compact: true, primary: '#3b82f6', animation: true };
/** 系统默认行为偏好（App.prefs 内建默认）：缺字段回落到此。默认退出前弹确认框。 */
const DEFAULT_PREFS = { confirmOnQuit: true };
/** 系统保留的键名：用户自定义存储不可占用（防污染 App 命名空间）。 */
const RESERVED_KEYS = new Set(['App']);
/** 原型污染防护：这些键名一律拒绝。 */
const BANNED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
/**
 * 系统配置总线（App.config）：管理系统保留命名空间 App（主题等），带系统内建默认值，
 * 并从实体库 flux_app.kv 回灌/落盘（整份 App 命名空间存为一条 json 记录）。所有窗口订阅同一份
 * → 一处 set 全窗同步刷新。addon 不可用时读写降级为纯内存（不影响抓帧探针）。
 */
class ConfigStore {
    constructor() {
        this._data = { App: { theme: { ...DEFAULT_THEME }, prefs: { ...DEFAULT_PREFS } } };
        // 监听数随窗口数线性增长（每扇窗订一次换肤同步背景），且关窗已退订；取消默认 10 上限以免 MaxListenersExceededWarning。
        this._ee = new events_1.EventEmitter();
        this._ee.setMaxListeners(0);
        this._hydrate();
    }
    /** 从 flux_app.kv 回灌 App 命名空间：逐字段浅覆盖默认（theme/prefs 各再深一层合并默认）。 */
    _hydrate() {
        const rec = db.get('app', 'App');
        if (rec && rec.type === 'json') {
            const saved = rec.value;
            this._data = {
                App: {
                    ...this._data.App,
                    ...saved,
                    theme: { ...DEFAULT_THEME, ...(saved.theme ?? {}) },
                    prefs: { ...DEFAULT_PREFS, ...(saved.prefs ?? {}) },
                },
            };
        }
    }
    /** 把当前 App 命名空间落盘。 */
    _persist() {
        db.set('app', 'App', 'json', this._data.App);
    }
    /** 全量快照（订阅回调即拿到整份系统配置，含 App 命名空间） */
    get() {
        return this._data;
    }
    /** 读系统保留命名空间 App */
    getApp() {
        return this._data.App;
    }
    /** 读主题配置（App.theme 便捷访问） */
    getTheme() {
        return this._data.App.theme;
    }
    /** 系统内建：更新主题（浅合并进 App.theme → 落盘，全同值则不广播） */
    setTheme(patch) {
        const cur = this._data.App.theme;
        let changed = false;
        for (const k of Object.keys(patch)) {
            if (cur[k] !== patch[k]) {
                changed = true;
                break;
            }
        }
        if (!changed)
            return;
        this._data = {
            ...this._data,
            App: { ...this._data.App, theme: { ...cur, ...patch } },
        };
        this._persist();
        this._ee.emit('change', this._data);
    }
    subscribe(cb) {
        this._ee.on('change', cb);
        return () => {
            this._ee.off('change', cb);
        };
    }
    /** 读行为偏好（App.prefs 便捷访问） */
    getPrefs() {
        return this._data.App.prefs;
    }
    /** 系统内建：更新行为偏好（浅合并进 App.prefs → 落盘，全同值则不广播） */
    setPrefs(patch) {
        const cur = this._data.App.prefs;
        let changed = false;
        for (const k of Object.keys(patch)) {
            if (cur[k] !== patch[k]) {
                changed = true;
                break;
            }
        }
        if (!changed)
            return;
        this._data = {
            ...this._data,
            App: { ...this._data.App, prefs: { ...cur, ...patch } },
        };
        this._persist();
        this._ee.emit('change', this._data);
    }
}
/**
 * 用户自定义存储（App.user）：独立实体库 flux_user.kv，与系统层物理分离。
 * 每个键必须先 init(key, type, default?) 声明「名称 + 值类型 (+ 默认)」，之后 set 才允许，
 * 且写入值必须匹配声明类型（bool/num/str/json）。落盘为带类型前缀的二进制，非明文。
 * 校验：不可占用系统保留键（App）/原型污染键；重复 init 类型须一致（幂等）。
 */
class UserStore {
    constructor() {
        this._meta = new Map();
        this._data = new Map();
        // 同 ConfigStore：订阅者可随窗口/组件数增长且已正确增删，取消默认 10 上限。
        this._ee = new events_1.EventEmitter();
        this._ee.setMaxListeners(0);
    }
    /** 声明用户键：名称 + 值类型 + 可选默认。幂等；持久库已有同类型值则沿用，否则落默认并写盘。 */
    init(key, type, def) {
        this._assertKey(key);
        const exist = this._meta.get(key);
        if (exist !== undefined) {
            if (exist !== type) {
                throw new Error(`Application.user.init: 键 "${key}" 已声明为 ${exist}，不可改类型为 ${type}`);
            }
            return;
        }
        if (def !== undefined && !db.matchesType(def, type)) {
            throw new Error(`Application.user.init: 键 "${key}" 默认值与声明类型 ${type} 不符`);
        }
        this._meta.set(key, type);
        const rec = db.get('user', key);
        if (rec && rec.type === type) {
            this._data.set(key, rec.value);
        }
        else if (def !== undefined) {
            this._data.set(key, def);
            db.set('user', key, type, def);
        }
        this._ee.emit('change', this.snapshot());
    }
    /** 写值：键须已 init，且值类型匹配声明。落盘 + 广播。 */
    set(key, value) {
        const type = this._meta.get(key);
        if (type === undefined) {
            throw new Error(`Application.user.set: 键 "${key}" 未 init（用户存储需先 Application.user.init(key, type, default?) 声明类型）`);
        }
        if (!db.matchesType(value, type)) {
            throw new Error(`Application.user.set: 键 "${key}" 声明类型为 ${type}，写入了不匹配的值`);
        }
        if (this._data.get(key) === value)
            return;
        this._data.set(key, value);
        db.set('user', key, type, value);
        this._ee.emit('change', this.snapshot());
    }
    read(key) {
        return this._data.get(key);
    }
    /** 键的声明类型（未 init → undefined） */
    type(key) {
        return this._meta.get(key);
    }
    isInit(key) {
        return this._meta.has(key);
    }
    /** 已 init 的键名列表 */
    keys() {
        return Array.from(this._meta.keys());
    }
    remove(key) {
        if (!this._meta.has(key))
            return;
        this._meta.delete(key);
        this._data.delete(key);
        db.del('user', key);
        this._ee.emit('change', this.snapshot());
    }
    snapshot() {
        const out = {};
        for (const [k, v] of this._data)
            out[k] = v;
        return out;
    }
    subscribe(cb) {
        this._ee.on('change', cb);
        return () => {
            this._ee.off('change', cb);
        };
    }
    _assertKey(key) {
        if (RESERVED_KEYS.has(key)) {
            throw new Error(`Application.user: 键 "${key}" 为系统保留，用户不可占用（请改用其他 key）`);
        }
        if (BANNED_KEYS.has(key)) {
            throw new Error(`Application.user: 非法键名 "${key}"`);
        }
    }
}
class AppSingleton {
    constructor() {
        /** 系统层配置总线（App 命名空间 / 主题；flux_app.kv 持久化 + 系统内建默认） */
        this.config = new ConfigStore();
        /** 用户层自定义存储（需 init 声明类型；flux_user.kv 持久化，与系统层物理分离） */
        this.user = new UserStore();
        /** 用户日志（需 init 注册通道；统一写入 user 日志，与系统日志物理分离） */
        this.log = new log_1.UserLogStore();
        /**
         * 系统托盘（原生通知区图标）：进程级唯一句柄。不挂原生菜单（原生 PopupMenu 不能适配应用主题）。
         * · create({ tooltip, iconPath? }) 建托盘；回调 onLeftClick/onDoubleClick/onRightClick(cb)（cb 收 {action, button}）。
         * · 左/双击唤主窗、右键渲染自定义主题菜单等应用级行为不在此处：上层订阅自行路由（见 gallery 接线）。
         * addon 不可用时全部方法 no-op（不影响纯 tsc/单测/非原生环境）。事件由原生 pump() 同一条泵回抛。
         */
        this.tray = tray_1.tray;
        this._windows = new Map();
        this._order = []; // 打开顺序（末位 = 最近打开），用于 main()/最上层
        this._modalStack = [];
        this._factory = null;
    }
    /** renderer 启动时注入开窗工厂（打破 App↔renderer 循环） */
    __setWindowFactory(f) {
        this._factory = f;
    }
    /** 由 WindowHost 建窗时调用：登记 + 若 modal 则入模态栈 */
    register(rec) {
        this._windows.set(rec.id, rec);
        if (!this._order.includes(rec.id))
            this._order.push(rec.id);
        if (rec.modal && !this._modalStack.includes(rec.id))
            this._modalStack.push(rec.id);
        (0, log_1.sysLog)(`[window] register id=${rec.id} title="${rec.title}" modal=${rec.modal} tag=${rec.tag ?? ''}`);
    }
    /** 由 WindowHost 关窗时调用：摘登记 + 出模态栈 */
    unregister(id) {
        const rec = this._windows.get(id);
        this._windows.delete(id);
        const oi = this._order.indexOf(id);
        if (oi >= 0)
            this._order.splice(oi, 1);
        const mi = this._modalStack.indexOf(id);
        if (mi >= 0)
            this._modalStack.splice(mi, 1);
        (0, log_1.sysLog)(`[window] unregister id=${id} title="${rec ? rec.title : ''}"`);
    }
    windows() {
        return this._order.map((id) => this._windows.get(id)).filter(Boolean);
    }
    get(id) {
        return this._windows.get(id);
    }
    findByTag(tag) {
        for (const id of this._order) {
            const r = this._windows.get(id);
            if (r && r.tag === tag)
                return r;
        }
        return undefined;
    }
    /** 最先打开的窗（通常 = 主窗） */
    main() {
        const id = this._order[0];
        return id !== undefined ? this._windows.get(id) : undefined;
    }
    /**
     * 对外接口：取某扇窗当前帧率（每秒实际上屏帧数）。
     * 缺省 windowId = 主窗；传 id 取指定窗。拿不到窗/host 返 0。
     * FPS 来自 host.getFps()：基于「实际上屏帧」的 ~0.5s 滚动窗口，空闲（>1s 无新帧）返 0。
     */
    getFps(windowId) {
        const rec = windowId == null ? this.main() : this.get(windowId);
        const host = rec?.host;
        if (host && typeof host.getFps === 'function')
            return host.getFps();
        return 0;
    }
    /** 逐窗帧率快照（供监控面板）：按打开顺序返回 [{ id, title, fps }]。 */
    fpsSnapshot() {
        return this.windows().map((r) => ({
            id: r.id,
            title: r.title,
            fps: r.host && typeof r.host.getFps === 'function' ? r.host.getFps() : 0,
        }));
    }
    /**
     * 唤醒并前置主窗（从最小化恢复 + 抢前台焦点）。
     * 供单实例「打包后重复打开 → 唤起老 App」的次实例回调调用：
     *   onSecondInstance(() => Application.wakeMainWindow())。
     * 无窗 / host 不支持 focus 时静默降级（不影响运行）。
     */
    wakeMainWindow() {
        const host = this.main()?.host;
        if (host && typeof host.focus === 'function') {
            host.focus();
            (0, log_1.sysLog)('[window] wakeMainWindow: 主窗已唤醒前置');
        }
        else {
            (0, log_1.sysLog)('[window] wakeMainWindow: 无主窗或不支持 focus，忽略');
        }
    }
    /**
     * 主窗当前 DPI 缩放因子（托盘物理坐标→逻辑坐标换算用）。
     * 托盘事件回抛的 rect 是物理像素，而 Window 的 x/y 走逻辑像素：
     * 弹托盘菜单前除以本值（取自主窗所在显示器，与任务区同屏）。
     * 无主窗 / host 未就绪时回落 1（不致崩，坐标在 100% 缩放下仍正确）。
     */
    getMainWindowScale() {
        const host = this.main()?.host;
        if (host && typeof host.getScale === 'function') {
            const s = host.getScale();
            return s > 0 ? s : 1;
        }
        return 1;
    }
    /** 命令式开一扇新窗（转交 renderer 工厂；host 建好后自登记，id 届时可知） */
    open(opts) {
        if (!this._factory) {
            throw new Error('Application.open: 开窗工厂未就绪（请确保已 import 渲染入口）');
        }
        this._factory(opts);
    }
    /** 按 id 关窗（调 host.close → Rust 隐藏摘除 + 本地退泵/计数） */
    close(id) {
        const r = this._windows.get(id);
        if (r && r.host && typeof r.host.close === 'function')
            r.host.close();
        this.unregister(id);
    }
    /** 按 tag 关窗（demo 的「关闭设置」用）；返回是否命中 */
    closeTag(tag) {
        const r = this.findByTag(tag);
        if (!r)
            return false;
        this.close(r.id);
        return true;
    }
    /** 当前模态栈顶（无模态窗 = undefined） */
    topModal() {
        return this._modalStack[this._modalStack.length - 1];
    }
    /** 输入门：存在活动模态窗且本窗非栈顶 → 拦截本窗一切交互 */
    shouldBlockInput(id) {
        const top = this.topModal();
        if (top === undefined)
            return false;
        return id !== top;
    }
}
/** 全局唯一实例 */
exports.Application = new AppSingleton();
