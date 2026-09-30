"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinitWindow = void 0;
const app_icon_1 = require("./app-icon");
const color_1 = require("../utils/color");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lab = require('../../../index.js');
// 存活窗口计数：最后一个窗口关闭时显式退出进程。
// 否则 TSFN 句柄会把 Node 事件循环吊住不退出，而 leak 的 HWND 停泵后消息无人抽 → Windows「未响应」幽灵窗。
let liveWindows = 0;
// ---- 全局事件泵协调器 ----
// Rust 侧只有「一条」底座事件循环（pump() 一次泵全部窗口的事件，按 window_id 路由到各自 tsfn）。
// 因此多窗口绝不能各起一个 setInterval 去 pump（=N 倍重复泵 + 事件洪），改为进程内共享唯一一条定时器。
// 帧绘制仍由上层全局 scheduleFrame 驱动（host 传 onFrame=undefined），本定时器只负责「收 OS 输入事件」。
let pumpTimer = null;
let pumpUsers = 0;
function acquirePump() {
    pumpUsers += 1;
    if (pumpTimer)
        return;
    pumpTimer = setInterval(() => {
        try {
            // pump 返回 true = event_loop 已消失（未开窗/已退）；停泵即可，末窗退进程由 liveWindows 兜底
            const exit = lab.pump();
            if (exit && pumpTimer) {
                clearInterval(pumpTimer);
                pumpTimer = null;
            }
        }
        catch (e) {
            // 单拍异常不致命（下一拍继续）；连续错误由 host 侧帧日志暴露
        }
    }, 16);
}
function releasePump() {
    pumpUsers = Math.max(0, pumpUsers - 1);
    // 不主动停泵：pumpUsers 归零时进程本就要退出（见 _shutdown 的 liveWindows 逻辑）
}
class WinitWindow {
    constructor(opts) {
        this._listeners = Object.create(null);
        this.scale = 1;
        this._lastLogical = { x: -1, y: -1 };
        this._stopped = false;
        this._closed = false;
        this._frames = 0;
        /** 上次 present 的 data() 读回耗时（ms，诊断用：host 的 [frame] 日志据此拆 blit 大头） */
        this.lastDataMs = 0;
        /** 上次 present 的 Rust 贴屏（RGBA 转换 + GDI）耗时（ms，诊断用） */
        this.lastPasteMs = 0;
        liveWindows += 1;
        // 建窗前一次性给进程设独立 AUMID：否则任务栏按钮按 node.exe 归组、固定显示 node 图标（幂等，仅首窗真正生效）
        (0, app_icon_1.ensureAppUserModelId)();
        this.physW = opts.width;
        this.physH = opts.height;
        this.renderScale = opts.renderScale || 0; // 0 表示用原生 scale（1:1 快路径）
        // 建窗并拿回本窗 id（首窗会懒建全局 event_loop）；事件经本窗专属 tsfn 回抛，只收自己的流
        this.id = lab.createWindow(opts.width, opts.height, opts.title || 'react-native-flux-desktop', opts.x ?? null, opts.y ?? null, !!opts.onTop, opts.decorations === undefined ? null : !!opts.decorations, opts.transparent === undefined ? null : !!opts.transparent, opts.maximized === undefined ? null : !!opts.maximized, (err, raw) => this._onRaw(err, raw));
        // 建窗后立即贴图标：修「打包后任务栏显示 node.exe 绿色图标」——窗口不设图标时 Windows 回退到进程主 exe 图标
        (0, app_icon_1.attachWindowIcon)(this.id);
        // 建窗后应用缩放/尺寸约束（底座运行时 setter，无需建窗参数）：仅在显式给出时调用，失败静默降级。
        if (opts.resizable !== undefined) {
            try {
                lab.setResizable(this.id, !!opts.resizable);
            }
            catch {
                /* ignore */
            }
        }
        if (opts.minWidth !== undefined || opts.minHeight !== undefined) {
            try {
                lab.setMinSize(this.id, opts.minWidth ?? null, opts.minHeight ?? null);
            }
            catch {
                /* ignore */
            }
        }
        if (opts.maxWidth !== undefined || opts.maxHeight !== undefined) {
            try {
                lab.setMaxSize(this.id, opts.maxWidth ?? null, opts.maxHeight ?? null);
            }
            catch {
                /* ignore */
            }
        }
        // 居中：建窗后按主显示器尺寸与外框尺寸求左上角并移动（读不到显示器时 native 静默返回）。
        // 放在 createWindow 之后，因底座暂无 with_center，只能建窗后用 set_outer_position 定位。
        if (opts.center) {
            try {
                lab.centerWindow(this.id);
            }
            catch {
                /* ignore */
            }
        }
    }
    // ---- 事件分发（极简 emitter，无依赖）----
    on(type, cb) {
        (this._listeners[type] || (this._listeners[type] = [])).push(cb);
        return this;
    }
    _emit(type, payload) {
        const arr = this._listeners[type];
        if (arr)
            for (const cb of arr)
                cb(payload);
    }
    _onRaw(err, raw) {
        if (err || typeof raw !== 'string')
            return;
        let ev;
        try {
            // Rust 手写 JSON 只转义了 \\ 与 "，而底座 to_text 会把 Backspace/Enter/Tab/Escape
            // 映射成裸控制字符（\b \r \t \x1b）嵌进 key 字段 → JSON.parse 抛
            // “Bad control character”→事件被静默丢（backspace 假死的真凶）。
            // 解析前把全部裸 <0x20 控制字符预转义为 \uXXXX（合法 JSON 结构符不会落在此区间，安全）。
            const safe = raw.replace(/[\u0000-\u001f]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
            ev = JSON.parse(safe);
        }
        catch (e) {
            return;
        }
        this._normalize(ev);
    }
    _normalize(ev) {
        switch (ev.type) {
            case 'ready':
            case 'resize': {
                this.physW = ev.width;
                this.physH = ev.height;
                this.scale = ev.scale || this.scale || 1;
                const s = this._renderScale();
                this._emit('resize', {
                    logicalW: this.physW / this.scale,
                    logicalH: this.physH / this.scale,
                    physW: this.physW,
                    physH: this.physH,
                    scale: this.scale,
                    renderW: Math.round((this.physW / this.scale) * s),
                    renderH: Math.round((this.physH / this.scale) * s),
                    renderScale: s,
                });
                break;
            }
            case 'mousemove': {
                const x = ev.x / this.scale;
                const y = ev.y / this.scale;
                this._lastLogical = { x, y };
                this._emit('mousemove', { x, y });
                break;
            }
            case 'mouse':
                this._emit('mouse', {
                    action: ev.pressed ? 'down' : 'up',
                    x: this._lastLogical.x,
                    y: this._lastLogical.y,
                    button: (ev.button || 'left'),
                });
                break;
            case 'wheel':
                this._emit('wheel', {
                    dx: ev.dx,
                    dy: ev.dy,
                    mode: (ev.mode || 'line'),
                    x: this._lastLogical.x,
                    y: this._lastLogical.y,
                });
                break;
            case 'key':
                this._emit('key', {
                    down: ev.down,
                    key: ev.key,
                    repeat: ev.repeat,
                    shift: ev.shift,
                    ctrl: ev.ctrl,
                    alt: ev.alt,
                    meta: ev.meta,
                });
                break;
            case 'ime':
                this._emit('ime', { action: ev.action, text: ev.text || '', caret: ev.caret });
                break;
            case 'drop':
                this._emit('drop', { action: ev.action, path: ev.path || '' });
                break;
            case 'focus':
                this._emit('focus', { focused: ev.focused });
                break;
            case 'mouseleave':
                this._emit('mouseleave', {});
                break;
            case 'closed':
                // Rust 侧该窗被 X 关闭（已 set_visible(false)+摘除）→ 本窗走关窗流程（末窗退进程）
                this._shutdown(0);
                break;
        }
    }
    /** 有效光栅倍率：renderScale 显式设定则用之（封顶 4），否则跟随原生 scale */
    _renderScale() {
        return this.renderScale > 0 ? Math.min(this.renderScale, 4) : this.scale;
    }
    /** 出画布尺寸（逻辑×renderScale），供上层建 canvas */
    renderSize() {
        const s = this._renderScale();
        return {
            w: Math.max(1, Math.round((this.physW / this.scale) * s)),
            h: Math.max(1, Math.round((this.physH / this.scale) * s)),
            renderScale: s,
            logicalW: this.physW / this.scale,
            logicalH: this.physH / this.scale,
        };
    }
    /** 贴一帧：收 @napi-rs/canvas 的 canvas（或 {data,width,height}），底层缩放铺到物理 */
    present(canvas) {
        if (this._stopped)
            return;
        const t0 = process.hrtime.bigint();
        const buf = typeof canvas.data === 'function' ? canvas.data() : canvas;
        const t1 = process.hrtime.bigint();
        const w = canvas.width;
        const h = canvas.height;
        lab.present(this.id, buf, w, h);
        const t2 = process.hrtime.bigint();
        this.lastDataMs = Number(t1 - t0) / 1e6;
        this.lastPasteMs = Number(t2 - t1) / 1e6;
        this._frames += 1;
    }
    setCursor(shape) {
        lab.setCursor(this.id, shape);
    }
    /** 运行时设/取消用户拖拽缩放 */
    setResizable(v) {
        try {
            lab.setResizable(this.id, !!v);
        }
        catch {
            /* 窗已关 */
        }
    }
    /** 当前是否可缩放（native 未就绪时按默认可缩放 true） */
    isResizable() {
        try {
            return !!lab.isResizable(this.id);
        }
        catch {
            return true;
        }
    }
    /** 设最小内尺寸（逻辑像素）：传 null/undefined 该维不设，两者都空 = 清除 */
    setMinSize(w, h) {
        try {
            lab.setMinSize(this.id, w ?? null, h ?? null);
        }
        catch {
            /* ignore */
        }
    }
    /** 设最大内尺寸（逻辑像素）：传 null/undefined 该维不设，两者都空 = 清除 */
    setMaxSize(w, h) {
        try {
            lab.setMaxSize(this.id, w ?? null, h ?? null);
        }
        catch {
            /* ignore */
        }
    }
    /** 以逻辑像素设定窗口内尺寸 */
    setSize(w, h) {
        try {
            lab.setSize(this.id, w, h);
        }
        catch {
            /* ignore */
        }
    }
    /** 当前内尺寸（逻辑像素）：native 未就绪返回 {0,0} */
    innerSize() {
        try {
            const a = lab.getInnerSize(this.id);
            return { w: a[0], h: a[1] };
        }
        catch {
            return { w: 0, h: 0 };
        }
    }
    /** 运行时设/取消标题栏与边框 */
    setDecorations(v) {
        try {
            lab.setDecorations(this.id, !!v);
        }
        catch {
            /* 窗已关 */
        }
    }
    /** 当前是否有标题栏/边框（无窗兜底 true） */
    isDecorated() {
        try {
            return !!lab.isDecorated(this.id);
        }
        catch {
            return true;
        }
    }
    /** 最大化 / 还原 */
    setMaximized(v) {
        try {
            lab.setMaximized(this.id, !!v);
        }
        catch {
            /* ignore */
        }
    }
    /** 当前是否最大化 */
    isMaximized() {
        try {
            return !!lab.isMaximized(this.id);
        }
        catch {
            return false;
        }
    }
    /** 最小化 / 从最小化恢复 */
    setMinimized(v) {
        try {
            lab.setMinimized(this.id, !!v);
        }
        catch {
            /* ignore */
        }
    }
    /** 唤醒并前置本窗：从最小化恢复 + 抢前台焦点（native focus_window） */
    focusWindow() {
        try {
            lab.focusWindow(this.id);
        }
        catch {
            /* ignore */
        }
    }
    /** 运行时把本窗在主显示器居中 */
    center() {
        try {
            lab.centerWindow(this.id);
        }
        catch {
            /* ignore */
        }
    }
    /** 以逻辑坐标移动本窗到 (x, y)（外框左上角） */
    setPosition(x, y) {
        try {
            lab.setWindowPosition(this.id, x, y);
        }
        catch {
            /* ignore */
        }
    }
    /** 本窗所在主显示器尺寸与原点（逻辑像素）：native 未就绪返回全 0 */
    monitorSize() {
        try {
            const a = lab.getMonitorSize(this.id);
            return { x: a[0], y: a[1], w: a[2], h: a[3] };
        }
        catch {
            return { x: 0, y: 0, w: 0, h: 0 };
        }
    }
    /** 本窗外框左上角当前坐标（逻辑像素）：native 未就绪返回 {0,0} */
    getPosition() {
        try {
            const a = lab.getOuterPosition(this.id);
            return { x: a[0], y: a[1] };
        }
        catch {
            return { x: 0, y: 0 };
        }
    }
    setTitle(t) {
        lab.setTitle(this.id, t);
    }
    /** 同步背景色：hex 解为 RGB 后交给 native 存入 Entry.bg（拖动缩放时填充露出区域）。native 未就绪则静默降级。 */
    setBackground(hex) {
        const { r, g, b } = (0, color_1.parse)(hex);
        try {
            lab.setBackground(this.id, r, g, b);
        }
        catch {
            /* native 未就绪 / 窗口已关：忽略，不影响运行 */
        }
    }
    get scaleFactor() {
        return this.scale;
    }
    /** 启动全局事件泵（共享唯一一条定时器）；onFrame/fps 仅为兼容旧签名，帧实际由上层 scheduleFrame 驱动 */
    run(_onFrame, _fps) {
        acquirePump();
        return this;
    }
    _shutdown(code, err) {
        if (this._closed)
            return;
        this._closed = true;
        this._stopped = true;
        if (err)
            console.error('[WinitWindow] tick error: ' + (err.message || String(err)));
        this._emit('close', { frames: this._frames });
        if (err)
            process.exitCode = code;
        // 让本窗退出共享泵计数；末窗关闭：主动结束进程（leak 的 HWND + TSFN 句柄不会让 Node 自然退出）
        releasePump();
        liveWindows = Math.max(0, liveWindows - 1);
        if (liveWindows === 0) {
            process.exit(process.exitCode || 0);
        }
    }
    /** 主动关闭：请求 Rust 隐藏+摘除本窗（set_visible(false) + drop Surface），再走本地关窗流程。
     *  注意：Rust 侧窗口是 leak 的，HWND 真正销毁依赖末窗退进程。 */
    close() {
        try {
            lab.closeWindow(this.id);
        }
        catch (e) {
            /* 窗已不存在 */
        }
        this._shutdown(0);
    }
}
exports.WinitWindow = WinitWindow;
