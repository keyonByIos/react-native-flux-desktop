"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowHost = void 0;
// 窗口宿主（底座版）：由 react-native-flux-skia 的 Qt host.ts 演进而来，
// 把「窗口/输入/贴图」三件事从 nodegui 换成 PlatformWindow 契约（本仓库默认 WinitWindow 实现）。
// 平台无关的编排（布局 → 绘制 → 命中 → 事件语义 → dpr 封顶 → onLayout 派发）原样保留。
const node_1 = require("../scene/node");
const yoga_1 = require("../layout/yoga");
const painter_1 = require("../paint/painter");
const scheduler_1 = require("../frame/scheduler");
const hit_1 = require("../events/hit");
const coordinator_1 = require("../events/coordinator");
const drop_1 = require("../events/drop");
const drag_1 = require("./drag");
const textinput_1 = require("../events/textinput");
const flatten_1 = require("../style/flatten");
const contextmenu_1 = require("./contextmenu");
const textselect_1 = require("./textselect");
const clipboard_1 = require("./clipboard");
const textLayout_1 = require("../paint/textLayout");
const winit_window_1 = require("./winit-window");
const gpu2d_proxy_1 = require("./gpu2d-proxy");
const app_1 = require("../app");
/** line 模式滚轮：每「一行」折算的像素（底座只报原始行数，折算留给上层） */
const WHEEL_LINE_PX = 50;
/** 原生可能把命名键 to_text 成控制字符，这里还原成规范名，供编辑逻辑识别 */
const CONTROL_NAME = {
    '\r': 'Enter',
    '\n': 'Enter',
    '\t': 'Tab',
    '\u007f': 'Backspace',
    '\b': 'Backspace',
    '\u001b': 'Escape',
};
class WindowHost {
    /** 延后触发生命周期回调（避开 reconciler commit 期同步 setState 警告）；吞掉回调内异常。 */
    _fire(cb) {
        if (typeof cb !== 'function')
            return;
        setTimeout(() => {
            try {
                cb();
            }
            catch {
                /* 用户回调异常不影响窗口 */
            }
        }, 0);
    }
    constructor(root, win) {
        this.pressed = null;
        this.hovered = null;
        /** 左键按住态 + 按下时命中的可编辑字段：供拖动选词（mousemove 期间延伸 caret） */
        this.mouseDown = false;
        this.dragEd = null;
        /** in-app 拖拽：按下时命中的拖拽源（未越位移阈值前的候选）；越过则起拖，无移动即松手则当普通点击 */
        this.pendingDrag = null;
        /** 静态文本长按选中会话：按住 500ms 不动即选中（命中 selectable 文本才启动） */
        this.lpTimer = null;
        this.lpNode = null;
        this.lpStart = { x: 0, y: 0 };
        this.lastSize = { w: 0, h: 0 };
        // ---- GPU 模式状态 ----
        /** FLUX_GPU=1 且 GpuCtx2D 可用时为 true，renderFrame 走 GPU 直绘路径 */
        this._gpuMode = false;
        this._gpuCtx = null;
        // ---- 滚动条带缓存（scroll blit）：纯滚动帧只搬视口 + 补画新露出窄条，全窗拷贝零次 ----
        /** 双面画布乒乓：blit 永远「读已显示面、写另一面」（异画布，无 napi 同画布重叠自拷贝的行序陷阱）。
         *  target 的视口区被 位移拷贝+S/C/R 补画区完全覆盖，无需底图整拷；视口外静区仅在
         *  上一帧是全量帧（facesOutOfSync）时从已显示面补拷一次四边矩形 */
        this.faces = [null, null];
        /** 最近一帧展示内容落在 faces 哪一面（-1 = 无） */
        this.lastShownIdx = -1;
        /** 两面的视口外静区是否一致：全量帧后置 true（场景变了，另一面静区可能过期），blit 同步后清除 */
        this.facesOutOfSync = true;
        /** 当前展示内容所在的物理画布（grab/snapshot 语义：最近一帧画面） */
        this.shownCanvas = null;
        /** 旧 surface 别名：指向「上一帧所用绘制面」（grab/snapshot/尺寸判定沿用旧语义） */
        this.surface = null;
        /** 上一帧 present 后的场景树变更序号；与当前不等 = 树动过 → 不可 blit */
        this.lastEpoch = -1;
        /** 上次跑过 calculateLayout 时的场景 epoch；不变 → 纯滚动帧跳过重排 */
        this.lastLayoutEpoch = -1;
        /** 上一帧各滚动节点的快照（scrollX/Y + 视口盒）；本帧恰好只有 1 个变化才 blit */
        this.prevScrolls = new Map();
        /** 图片解码到位等外部脏：下一帧必须整帧重绘 */
        this.extDirty = true;
        /** 空闲窗跳帧基线：上次贴屏时的滚动签名（滚动不经 __mutEpoch，用它兜住滚轮/受控/程序化滚动）；null=活动期已作废 */
        this._scrollSig = null;
        /** 空闲窗跳帧基线：上次贴屏时全局 imageGen。setImageReadyNotifier 是全局单例（后建窗覆盖），extDirty
         *  只能抵一窗；本窗不是宿主时，新图就绪不会推 epoch 也不会设 extDirty，仅靠 counter 变化识别——
         *  否则含图空闲窗会跳过那一帧，新图区域停在占位底图（横条元素呈一条横线残影）。-1 = 无效基线，下一帧强制重绘。*/
        this.lastImageGen = -1;
        /** 【临时诊断】帧计数：每 120 帧 dump 一次场景树 kind 直方图 + 最胖父节点路径，定位节点泄漏 */
        this._dbgN = 0;
        /** 【临时诊断】[mem] 每 2s 时间驱动采样（静置也采）：rss/heap/ext/ab + 节点数 + 该窗口期帧数，区分高水位 vs 真泄漏 */
        this._memTimer = null;
        this._lastDbgN = 0;
        /** 上一次收到连续 move 的目标（带 onMouseMove 的节点）：目标切换时对旧目标补发 onMouseMoveLeave */
        this._moveT = null;
        /** 悬停节点自带 hover/pressed 样式（绘制期直接生效，不经 epoch 上报）：blit 需回避 */
        this.hoverVisual = false;
        /** 诊断用：本帧放弃 blit 的原因（帧日志 skip=） */
        this.blitSkip = '';
        /** 共存模式记录：每帧脏节点重画后的矩形链；full 帧不清（陈旧由帧号距离筛） */
        this.coexistRects = [];
        /** 共存模式帧号：只在 coexist blit 帧递增；记录 f 与本帧差 ≤1 = 上一 coexist 帧刚画过，旧态承接才可信 */
        this.coexistFrame = 0;
        /** 诊断计数：blit 帧 / 全量帧 / 共存帧（blit+脏重画）累计（像素一致性验证脚本校验「确实命中过」） */
        this.__blitFrames = 0;
        this.__fullFrames = 0;
        this.__coexistHits = 0;
        /** 诊断计数：布局门控命中率（calculateLayout 实跑次数 / 总帧数） */
        this.__layoutRuns = 0;
        this.__frameCount = 0;
        // 窗口尺寸/DPI 由 PlatformWindow 的 resize 事件异步送达（Qt 是同步读 win.width()）
        this._ready = false;
        this._logicalW = 0;
        this._logicalH = 0;
        this._nativeScale = 1;
        this._destroyed = false;
        /** 主题订阅退订句柄：换肤时同步窗口背景色，关窗时退订 */
        this.unsubscribeTheme = null;
        /** 窗口生命周期回调（来自 <Window> props）：准备加载/加载中/加载完成/关闭；focused = 焦点变化（带布尔参） */
        this._cbs = {};
        /** 加载完成回调只触发一次（首帧贴屏后置位） */
        this._readyFired = false;
        /**
         * onLayout 派发：布局结果与上次缓存不一致才回调，天然收敛，不会形成重渲染循环。
         */
        this.layoutRects = new Map();
        this.layoutAbsRects = new Map();
        /** 一帧：布局 → 绘制 → 贴图（present 到物理帧缓冲） */
        this._prevFrameEnd = 0;
        // ── 帧率（FPS）计量：本窗「实际上屏帧」的滚动速率 ──
        // renderFrame 只在有帧被调度（React commit / 动画）时运行，故空闲时 FPS→0（不虚高 60），
        // 语义就是「这扇窗当前每秒真实画了几帧」。~0.5s 滚动窗口刷新一次读数，避免跳变。
        this._fps = 0;
        this._fpsSecFrames = 0;
        this._fpsSecStart = 0;
        this.root = root;
        root.__host = this;
        // 【临时诊断】FLUX_DEBUG 下每 2s 打一条 [mem]（时间驱动，不依赖帧）：看 rss/heapUsed/heapTotal/external/arrayBuffers 哪块在涨 + 节点数 + 帧数
        if (process.env.FLUX_DEBUG) {
            const MB = 1048576;
            this._memTimer = setInterval(() => {
                try {
                    const u = process.memoryUsage();
                    const st = this.getMemStats();
                    const frames = this._dbgN - this._lastDbgN;
                    this._lastDbgN = this._dbgN;
                    console.log(`[mem] rss=${(u.rss / MB).toFixed(1)} heap=${(u.heapUsed / MB).toFixed(1)}/${(u.heapTotal / MB).toFixed(1)} ext=${(u.external / MB).toFixed(1)} ab=${((u.arrayBuffers || 0) / MB).toFixed(1)} MB | nodes=${st.nodes} frames/2s=${frames} ${Math.round(st.w)}x${Math.round(st.h)}@${st.dpr}`);
                }
                catch { /* 探针不得影响渲染 */ }
            }, 2000);
        }
        const props = root.props || {};
        const width = Number(props.width) || 800;
        const height = Number(props.height) || 600;
        const x = props.x !== undefined ? Number(props.x) : undefined;
        const y = props.y !== undefined ? Number(props.y) : undefined;
        // 顶层窗：显式 alwaysOnTop 优先，否则模态窗默认置顶（保证子窗不被主窗遮挡）
        const onTop = props.alwaysOnTop !== undefined ? !!props.alwaysOnTop : !!props.modal;
        // 缩放/尺寸约束：resizable 未给则 undefined（跟随系统默认可缩放）；min/max 任一维单独透传
        const resizable = props.resizable !== undefined ? !!props.resizable : undefined;
        const decorations = props.decorations !== undefined ? !!props.decorations : undefined;
        const transparent = props.transparent !== undefined ? !!props.transparent : undefined;
        const maximized = props.maximized !== undefined ? !!props.maximized : undefined;
        // 位置：显式给 x/y 用其定位；否则默认在主显示器居中（主窗/对话框常见期望）。
        // 显式传 center 覆盖：center=false 且无 x/y → 退回 OS 层叠摆放。
        const hasXY = x !== undefined && y !== undefined;
        const center = props.center !== undefined ? !!props.center : !hasXY;
        const num = (v) => v === undefined || v === null || v === '' ? undefined : Number(v);
        // 生命周期：暂存回调；建窗前发「准备加载」、建窗后发「加载中」（首帧在 renderFrame 发「加载完成」）
        this._cbs = {
            preparing: props.onPreparing,
            loading: props.onLoading,
            ready: props.onReady,
            close: props.onClose,
            focused: props.onFocused,
        };
        this._fire(this._cbs.preparing);
        this.win =
            win ||
                new winit_window_1.WinitWindow({
                    width,
                    height,
                    title: String(props.title ?? 'Flux'),
                    x,
                    y,
                    onTop,
                    resizable,
                    minWidth: num(props.minWidth),
                    minHeight: num(props.minHeight),
                    maxWidth: num(props.maxWidth),
                    maxHeight: num(props.maxHeight),
                    decorations,
                    transparent,
                    maximized,
                    center,
                });
        this._fire(this._cbs.loading);
        // GPU 模式检测：FLUX_GPU=1 且 native addon 暴露 GpuCtx2D 时启用。
        // 失败静默降级到 CPU（与 Rust 侧 GPU init 失败降级策略一致）。
        if ((0, gpu2d_proxy_1.gpuAvailable)() && this.win.id !== undefined) {
            this._gpuMode = true;
            this._gpuCtx = new gpu2d_proxy_1.Gpu2DProxy(this.win.id);
        }
        // 同步窗口背景色与主页面一致（暗 #141414 / 亮 #ffffff）：拖动缩放时旧帧未覆盖的露出区域
        // 用此色填充，避免黑底割裂。建窗即同步一次，并订阅主题变化持续跟随；关窗退订。
        // 透明窗（transparent）不强制不透明背景：跳过同步，保留内容自身决定的底色。
        if (!transparent) {
            const syncWinBg = () => {
                const setBackground = this.win.setBackground;
                if (typeof setBackground !== 'function')
                    return;
                const hex = app_1.Application.config.getTheme().dark ? '#141414' : '#ffffff';
                setBackground.call(this.win, hex);
            };
            syncWinBg();
            this.unsubscribeTheme = app_1.Application.config.subscribe(() => syncWinBg());
        }
        this.unregister = (0, scheduler_1.registerFrameTask)(() => this.renderFrame());
        this.bindEvents();
        // 登记进全局 Application：供跨窗管理（open/close/find）+ 模态输入门控（shouldBlockInput）
        app_1.Application.register({
            id: this.windowId(),
            title: String(props.title ?? 'Flux'),
            tag: props.tag !== undefined ? String(props.tag) : undefined,
            parentId: props.parentId !== undefined ? Number(props.parentId) : undefined,
            modal: !!props.modal,
            host: this,
        });
        (0, painter_1.setImageReadyNotifier)(() => {
            this.extDirty = true; // 图到位：下一帧必须整帧重绘（条带缓存会把新图漏在底图外）
            (0, scheduler_1.scheduleFrame)();
        });
        (0, scheduler_1.scheduleFrame)();
        // 启动 pump 主循环（取代 Qt 的 exec）：每拍泵一次底座事件，帧由 scheduleFrame 驱动
        this.win.run(undefined, 60);
    }
    /**
     * 光栅倍率（dpr）：blit 成本随像素数平方增长，故留一个可封顶的开关。
     * 默认「跟随原生 scale」——不降采样，保证 present 走 1:1 无重采样（高分屏不糊）。
     * 仅当 FLUX_MAX_DPR 显式设定（>0）时才封顶；
     * ⚠️ 把封顶压到低于原生 scale 会让 present 做非整数倍最近邻上采样 → 边缘阶梯锯齿
     *    （scale=2 屏封顶 1.5 → 放大 2/1.5=1.333，实测斜线阶梯度恶化约 12×），故默认不再封顶。
     */
    dpr() {
        let r = this._nativeScale;
        r = r && r > 0 ? Math.round(r * 100) / 100 : 1;
        const capEnv = process.env.FLUX_MAX_DPR;
        if (capEnv !== undefined) {
            const cap = Number(capEnv) || 0; // 0 = 不封顶（等同跟随原生）
            if (cap > 0 && r > cap)
                r = cap;
        }
        return r;
    }
    /** 本窗 platform id（注入的 mock 窗无 id → -1；Application 门控遇 -1 恒不拦） */
    windowId() {
        return this.win.id ?? -1;
    }
    /**
     * 诊断：本窗渲染面 + 场景规模快照（供 MemMonitor 逐窗展示，纯只读不改状态）。
     * faces 存逻辑 w/h，物理像素 = round(w·dpr)×round(h·dpr)，每面 RGBA 4 字节，双缓冲 ×面数。
     * nodes = 从 root 递归计的场景节点数（近似本窗 React 树规模，供堆摊算用）。
     */
    getMemStats() {
        const w = this._logicalW || this.lastSize.w || 0;
        const h = this._logicalH || this.lastSize.h || 0;
        const dpr = this.dpr();
        const faceCount = this.faces.reduce((a, f) => a + (f ? 1 : 0), 0);
        const pw = Math.round(w * dpr);
        const ph = Math.round(h * dpr);
        const surfaceMB = (faceCount * pw * ph * 4) / (1024 * 1024);
        let nodes = 0;
        const walk = (n) => {
            nodes += 1;
            for (const c of n.children)
                walk(c);
        };
        walk(this.root);
        return { w, h, dpr, faces: faceCount, surfaceMB, nodes };
    }
    /** 模态门：存在活动模态窗且本窗非栈顶 → 本窗应吞掉交互输入（仍照常渲染） */
    inputBlocked() {
        return app_1.Application.shouldBlockInput(this.windowId());
    }
    bindEvents() {
        this.win.on('resize', (info) => {
            (0, contextmenu_1.hideContextMenu)(); // 菜单是窗口坐标浮层，尺寸变了锚点即失效，收起
            (0, textselect_1.clearTextSelection)(); // 同上：高亮块与文本错位，清选
            this._logicalW = info.logicalW;
            this._logicalH = info.logicalH;
            this._nativeScale = info.scale || 1;
            this._ready = true;
            (0, scheduler_1.scheduleFrame)();
        });
        this.win.on('mousemove', (m) => this.onMouseMove(m.x, m.y));
        this.win.on('mouse', (m) => {
            // 右键：命中可编辑字段则弹上下文菜单，否则收起已有菜单（M1 曾直接忽略非主键）。
            if (m.button === 'right') {
                if (m.action === 'down')
                    this.onContextMenu(m.x, m.y);
                return;
            }
            if (m.button !== 'left')
                return;
            if (m.action === 'down') {
                // 命中开启 selectable 的静态文本 → 埋长按定时器（短按/移动会各自取消）
                const sel = this.findSelectable((0, hit_1.hitTest)(this.root, m.x, m.y));
                if (sel)
                    this.startLongPress(sel, m.x, m.y);
                this.onPress(m.x, m.y);
            }
            else
                this.onRelease(m.x, m.y);
        });
        this.win.on('wheel', (w) => this.onWheel(w));
        this.win.on('key', (k) => this.onKey(k));
        this.win.on('ime', (ime) => this.onIme(ime));
        this.win.on('mouseleave', () => this.onMouseLeaveWindow());
        // OS 文件拖放：喂给拖放总线（按激活目标路由，无坐标），并请求重绘以更新高亮
        this.win.on('drop', (d) => {
            (0, drop_1.feedDrop)(d.action, d.path);
            (0, scheduler_1.scheduleFrame)();
        });
        // 失焦（Alt+Tab 等）：终止拖选/按压会话，否则 mouseDown 残留导致回窗后无键幽灵拖选
        this.win.on('focus', (f) => {
            // 先向 React 透传焦点态（无框弹窗靠它「失焦即关」）；避开 commit 期同步 setState，延后一拍
            const cb = this._cbs.focused;
            if (typeof cb === 'function') {
                setTimeout(() => {
                    try {
                        cb(f.focused);
                    }
                    catch {
                        /* 用户回调异常不影响窗口 */
                    }
                }, 0);
            }
            if (!f.focused) {
                if ((0, drag_1.isDragging)())
                    (0, drag_1.cancelDrag)();
                this.pendingDrag = null;
                this.mouseDown = false;
                this.dragEd = null;
                this.pressed = null;
            }
        });
        this.win.on('close', () => this.onWindowClosed());
    }
    /** 键盘：仅按下驱动编辑；可见字符直接插入，命名键交聚焦字段处理 */
    onKey(k) {
        if (this.inputBlocked())
            return; // 模态门：锁定窗不响应键盘
        if (process.env.FLUX_KEYDEBUG)
            console.log('[key]', JSON.stringify(k));
        // 菜单开着时任何键先收菜单（原生行为）；Escape 仅收菜单不再下传（否则会把输入框一并 blur）
        if ((0, contextmenu_1.getContextMenuState)().visible) {
            (0, contextmenu_1.hideContextMenu)();
            if (k.key === '\u001b' || /^Named\(Escape\)$/.test(k.key))
                return;
        }
        // 无聚焦输入框时，Ctrl/Cmd+C 复制当前长按选中的静态文本（须在 activeController 空判之前）
        if (k.down && (k.ctrl || k.meta) && !(0, textinput_1.activeController)() && typeof k.key === 'string' && k.key.toLowerCase() === 'c') {
            const st = (0, textselect_1.getTextSelectionState)();
            if (st.visible && st.text) {
                (0, clipboard_1.writeClipboard)(st.text);
                return;
            }
        }
        const c = (0, textinput_1.activeController)();
        if (!c || !k.down)
            return;
        // IME 合成期间：原始按键（拼音字母等）交给输入法，不直接插入，避免与 commit 重复
        if (c.isComposing())
            return;
        let name = k.key;
        if (!name)
            return;
        // 原生对无 to_text 的命名键走 Debug 名（如 "Named(Backspace)"），剥壳还原规范名供编辑识别
        const nm = /^Named\((.+)\)$/.exec(name);
        if (nm)
            name = nm[1];
        const mods = { shift: !!k.shift, ctrl: !!k.ctrl, alt: !!k.alt, meta: !!k.meta };
        const keyName = CONTROL_NAME[name] || name;
        const cp = keyName.codePointAt(0) || 0;
        // 普通可见字符（排除控制字符与修饰键组合）→ 直接插入
        if (keyName.length === 1 && cp >= 33 && cp !== 127 && !mods.ctrl && !mods.meta && !mods.alt) {
            c.insertText(keyName);
            return;
        }
        if (keyName === ' ' && !mods.ctrl && !mods.meta && !mods.alt) {
            c.insertText(' ');
            return;
        }
        c.onKeyDown(keyName, mods);
    }
    /** IME：preedit 驱动合成态（下划线候选），commit 把文本插入并结束合成 */
    onIme(ime) {
        if (process.env.FLUX_KEYDEBUG)
            console.log('[ime]', JSON.stringify(ime));
        const c = (0, textinput_1.activeController)();
        if (!c)
            return;
        if (ime.action === 'commit') {
            if (ime.text)
                c.insertText(ime.text);
            c.setComposition('');
        }
        else if (ime.action === 'preedit') {
            c.setComposition(ime.text || '', ime.caret);
        }
    }
    onPress(x, y) {
        if (this.inputBlocked())
            return; // 模态门：本窗被上层模态窗锁定 → 吞掉点击
        // 任何左键按下先收起右键菜单与静态文本选中（点菜单项时本帧布局仍含菜单，命中不受影响）
        (0, contextmenu_1.hideContextMenu)();
        (0, textselect_1.clearTextSelection)();
        const hit = (0, hit_1.hitTest)(this.root, x, y);
        // 命中可编辑字段：切换焦点并按点击 x 落位光标；否则视为点空白/其它 → 取消焦点。
        const ed = (0, textinput_1.findEditable)(hit);
        if (ed) {
            (0, textinput_1.setActiveEditable)(ed);
            if (ed.__input)
                ed.__input.placeCaret(x - ed.ax, y - ed.ay);
        }
        else {
            (0, textinput_1.setActiveEditable)(null);
        }
        // 记录拖动会话：placeCaret 已把 anchor=caret=落点，后续 mousemove 只动 caret 即成拉选。
        this.mouseDown = true;
        this.dragEd = ed;
        // in-app 拖拽：命中拖拽源则埋候选（移动越阈才起拖），供 onMouseMove 判定
        const ds = (0, hit_1.findDraggable)(hit);
        this.pendingDrag = ds ? { id: ds.props.__drag.id, x, y } : null;
        const target = (0, hit_1.findPressable)(hit);
        this.pressed = target;
        if (target) {
            const cb = target.props.onPressIn;
            if (cb)
                cb();
            (0, scheduler_1.scheduleFrame)();
        }
    }
    /** 右键：命中可编辑字段→聚焦弹菜单；命中 selectable 静态文本→选中+复制菜单；否则收起。 */
    onContextMenu(x, y) {
        if (this.inputBlocked())
            return; // 模态门：锁定窗不响应右键
        const hit = (0, hit_1.hitTest)(this.root, x, y);
        const ed = (0, textinput_1.findEditable)(hit);
        if (ed && ed.__input && ed.__input.showContextMenu) {
            (0, textinput_1.setActiveEditable)(ed);
            const [px, py] = this.clampMenuPos(x, y);
            ed.__input.showContextMenu(px, py);
            (0, scheduler_1.scheduleFrame)();
            return;
        }
        const sel = this.findSelectable(hit);
        if (sel) {
            this.presentSelection(sel, x, y);
        }
        else {
            (0, contextmenu_1.hideContextMenu)();
        }
    }
    /** 菜单估算宽 200、高按项数估（每项 ~30 + 边距），贴边时往窗口内收 */
    clampMenuPos(x, y) {
        return [Math.max(4, Math.min(x, this._logicalW - 200)), Math.max(4, Math.min(y, this._logicalH - 200))];
    }
    /** 从命中节点向上找最近开了 selectable 的静态文本节点（默认全关，须显式开启） */
    findSelectable(node) {
        let cur = node;
        while (cur) {
            if (cur.kind === 'text' && cur.props && cur.props.selectable && cur.text)
                return cur;
            cur = cur.parent;
        }
        return null;
    }
    /** 选中呈现：算行矩形写 store，弹「复制」菜单（长按到点/右键命中共用） */
    presentSelection(n, x, y) {
        const text = n.text;
        (0, textselect_1.showTextSelection)(this.selectionRects(n), text);
        const [px, py] = this.clampMenuPos(x, y);
        const items = [{ label: '复制', onClick: () => (0, clipboard_1.writeClipboard)(text) }];
        (0, contextmenu_1.showContextMenu)(px, py, items);
        (0, scheduler_1.scheduleFrame)();
    }
    /** 镜像 paintText 的排版：contentBox 起点 + layoutText 逐行宽，给多行文本算每行高亮矩形 */
    selectionRects(n) {
        const s = n.style;
        const bl = (Number(s.borderLeftWidth) || 0) + (Number(s.paddingLeft) || 0);
        const br = (Number(s.borderRightWidth) || 0) + (Number(s.paddingRight) || 0);
        const bt = (Number(s.borderTopWidth) || 0) + (Number(s.paddingTop) || 0);
        const boxX = n.ax + bl;
        const boxY = n.ay + bt;
        const boxW = Math.max(1, n.w - bl - br);
        const maxLines = n.props.numberOfLines ? Number(n.props.numberOfLines) : undefined;
        const lay = (0, textLayout_1.layoutText)(n.text, s, boxW, maxLines, !!n.props.preserveTrailingSpace);
        const align = s.textAlign ?? 'left';
        const rects = [];
        lay.lines.forEach((line, i) => {
            let lx = boxX;
            if (align === 'center')
                lx = boxX + (boxW - line.width) / 2;
            else if (align === 'right')
                lx = boxX + boxW - line.width;
            rects.push({ x: lx - 1, y: boxY + i * lay.lineHeight, w: line.width + 2, h: lay.lineHeight });
        });
        return rects;
    }
    startLongPress(n, x, y) {
        this.cancelLongPress();
        this.lpNode = n;
        this.lpStart = { x, y };
        this.lpTimer = setTimeout(() => {
            this.lpTimer = null;
            const node = this.lpNode;
            this.lpNode = null;
            if (node)
                this.presentSelection(node, x, y);
        }, 500);
    }
    cancelLongPress() {
        if (this.lpTimer) {
            clearTimeout(this.lpTimer);
            this.lpTimer = null;
        }
        this.lpNode = null;
    }
    onRelease(x, y) {
        if (this.inputBlocked())
            return; // 模态门：锁定窗不响应释放
        this.cancelLongPress(); // 未达长按时长即松手：取消选中会话，走普通点击
        this.mouseDown = false;
        this.dragEd = null;
        // in-app 拖拽：拖拽中释放 → 锁定最终命中后派发 drop/cancel（不走下面的点击逻辑）
        if ((0, drag_1.isDragging)()) {
            const dn = (0, hit_1.findDroppable)((0, hit_1.hitTest)(this.root, x, y));
            (0, drag_1.moveDrag)(x, y, dn ? dn.props.__drop.id : null, dn && y < dn.ay + dn.h / 2 ? 'before' : 'after');
            (0, drag_1.dropDrag)();
            this.pendingDrag = null;
            (0, scheduler_1.scheduleFrame)();
            return;
        }
        this.pendingDrag = null;
        (0, coordinator_1.handleGlobalPress)(x, y);
        const up = (0, hit_1.findPressable)((0, hit_1.hitTest)(this.root, x, y));
        const down = this.pressed;
        this.pressed = null;
        if (down) {
            const out = down.props.onPressOut;
            if (out)
                out();
            // RN 语义：按下与抬起落在同一元素才算一次点击
            if (up === down && down.props.onPress)
                down.props.onPress();
        }
        (0, scheduler_1.scheduleFrame)();
    }
    onMouseMove(x, y) {
        if (this.inputBlocked())
            return; // 模态门：锁定窗不响应悬停/拖选
        // 长按未到点但移动超阈：取消（视为拖拽/普通移动，不是长按意图）
        if (this.lpTimer && (Math.abs(x - this.lpStart.x) > 6 || Math.abs(y - this.lpStart.y) > 6))
            this.cancelLongPress();
        // in-app 拖拽：已在拖 → 更新跟随 + 命中 drop 目标；未起拖但有候选且越阈 → 起拖（阈值前不跑 hover，避免闪烁）
        if ((0, drag_1.isDragging)()) {
            const dn = (0, hit_1.findDroppable)((0, hit_1.hitTest)(this.root, x, y));
            (0, drag_1.moveDrag)(x, y, dn ? dn.props.__drop.id : null, dn && y < dn.ay + dn.h / 2 ? 'before' : 'after');
            (0, scheduler_1.scheduleFrame)();
            return;
        }
        if (this.pendingDrag && this.mouseDown) {
            const th = 5;
            if (Math.abs(x - this.pendingDrag.x) > th || Math.abs(y - this.pendingDrag.y) > th) {
                const { id } = this.pendingDrag;
                this.pendingDrag = null;
                this.cancelLongPress();
                (0, drag_1.beginDrag)(id, x, y);
                const dn = (0, hit_1.findDroppable)((0, hit_1.hitTest)(this.root, x, y));
                (0, drag_1.moveDrag)(x, y, dn ? dn.props.__drop.id : null, dn && y < dn.ay + dn.h / 2 ? 'before' : 'after');
                (0, scheduler_1.scheduleFrame)();
            }
            return;
        }
        // 拖动选词：左键按住且按下时命中可编辑字段 → 持续延伸选区（跳过 hover 逻辑，避免光标/悬停闪烁）
        if (this.mouseDown && this.dragEd && this.dragEd.__input && this.dragEd.__input.selectTo) {
            this.dragEd.__input.selectTo(x - this.dragEd.ax, y - this.dragEd.ay);
            return;
        }
        const hit = (0, hit_1.hitTest)(this.root, x, y);
        // 连续 move 派发：向最近带 onMouseMove 的祖先每帧都发局部坐标（图表 hover 用，独立于 press/enter/leave 与光标）。
        // 目标变化（含移到无 handler 区→null）时对旧目标补发 onMouseMoveLeave；坐标 = 窗口坐标 - 节点绝对布局原点。
        const mt = (0, hit_1.findMoveTarget)(hit);
        if (mt !== this._moveT) {
            const old = this._moveT;
            if (old && old.props && old.props.onMouseMoveLeave)
                old.props.onMouseMoveLeave();
            this._moveT = mt;
        }
        if (mt && mt.props.onMouseMove)
            mt.props.onMouseMove({ nativeEvent: { locationX: x - mt.ax, locationY: y - mt.ay } });
        this.setCursor((0, hit_1.findCursor)(hit));
        const t = (0, hit_1.findPressable)(hit);
        const prev = this.hovered;
        if (prev === t)
            return;
        if (prev && prev.props.onMouseLeave)
            prev.props.onMouseLeave();
        this.hovered = t;
        this.hoverVisual = !!(t && t.props && (t.props.hoverStyle || t.props.pressedStyle));
        if (t && t.props.onMouseEnter)
            t.props.onMouseEnter();
        if (this.usesHoverStyle())
            (0, scheduler_1.scheduleFrame)();
    }
    onMouseLeaveWindow() {
        // 拖出窗口外 release 收不到，会话就地终止
        this.cancelLongPress();
        if ((0, drag_1.isDragging)())
            (0, drag_1.cancelDrag)();
        this.pendingDrag = null;
        this.mouseDown = false;
        this.dragEd = null;
        const prev = this.hovered;
        this.hovered = null;
        this.hoverVisual = false;
        if (prev && prev.props.onMouseLeave)
            prev.props.onMouseLeave();
        // 连续 move 目标同样随离窗清除（否则图表 tooltip 卡在最后一列）
        if (this._moveT && this._moveT.props && this._moveT.props.onMouseMoveLeave)
            this._moveT.props.onMouseMoveLeave();
        this._moveT = null;
        if (this.usesHoverStyle())
            (0, scheduler_1.scheduleFrame)();
    }
    onWheel(w) {
        if (this.inputBlocked())
            return; // 模态门：锁定窗不响应滚动
        (0, contextmenu_1.hideContextMenu)(); // 滚动时菜单与弹点脱节，收起
        (0, textselect_1.clearTextSelection)(); // 同理：高亮矩形是窗口坐标，滚动后与文本错位，清选
        const target = (0, hit_1.findScrollParent)((0, hit_1.hitTest)(this.root, w.x, w.y));
        if (!target)
            return;
        let dx;
        let dy;
        if (w.mode === 'pixel') {
            dx = w.dx;
            dy = w.dy;
        }
        else {
            dx = w.dx * WHEEL_LINE_PX;
            dy = w.dy * WHEEL_LINE_PX;
        }
        const horizontal = target.props.horizontal === true;
        const content = (0, node_1.scrollContentSize)(target);
        if (horizontal) {
            const max = Math.max(0, content.w - target.w + (0, flatten_1.toNumber)(target.style.paddingRight));
            const next = Math.max(0, Math.min(max, target.scrollX - dx));
            if (next === target.scrollX)
                return;
            target.scrollX = next;
        }
        else {
            const max = Math.max(0, content.h - target.h + (0, flatten_1.toNumber)(target.style.paddingBottom));
            const next = Math.max(0, Math.min(max, target.scrollY - dy));
            if (next === target.scrollY)
                return;
            target.scrollY = next;
        }
        const onScroll = target.props.onScroll;
        if (typeof onScroll === 'function') {
            onScroll({
                nativeEvent: {
                    contentOffset: { x: target.scrollX, y: target.scrollY },
                    contentSize: { width: content.w, height: content.h },
                },
            });
        }
        (0, scheduler_1.scheduleFrame)();
    }
    /** 只有真的用到 hover 样式才值得重绘整帧 */
    usesHoverStyle() {
        let found = false;
        const visit = (n) => {
            if (n.props && (n.props.hoverStyle || n.props.pressedStyle))
                found = true;
            for (const c of n.children)
                visit(c);
        };
        visit(this.root);
        return found;
    }
    setCursor(shape) {
        try {
            this.win.setCursor(shape);
        }
        catch (e) {
            /* 部分平台不支持 */
        }
    }
    /** 截图：把最近一帧画布存成 PNG（Qt 版走 win.grab，这里直接用 Skia 画布） */
    grab(path) {
        try {
            const canvas = this.shownCanvas || (this.surface && this.surface.canvas);
            if (canvas)
                require('fs').writeFileSync(path, canvas.toBuffer('image/png'));
        }
        catch (e) {
            console.warn('[flux-desktop] grab failed: ' + (e && e.message ? e.message : e));
        }
    }
    /** 按 id 在场景树找节点（getPublicInstance 把 SceneNode 直接交给 React ref，故组件 ref.current.id 可用） */
    findNode(id) {
        const visit = (n) => {
            if (n.id === id)
                return n;
            for (const c of n.children) {
                const r = visit(c);
                if (r)
                    return r;
            }
            return null;
        };
        return visit(this.root);
    }
    /** 区域快照：从最近一帧画布裁出某节点的 PNG（物理像素 = 逻辑坐标 × dpr）。拿不到返 null。 */
    snapshotNode(node) {
        try {
            const surface = this.surface;
            const full = this.shownCanvas || (surface && surface.canvas);
            if (!full || !surface || node.w <= 0 || node.h <= 0)
                return null;
            const dpr = surface.dpr;
            const { createCanvas } = require('@napi-rs/canvas');
            const pw = Math.max(1, Math.round(node.w * dpr));
            const ph = Math.max(1, Math.round(node.h * dpr));
            const out = createCanvas(pw, ph);
            const octx = out.getContext('2d');
            octx.drawImage(full, Math.round(node.ax * dpr), Math.round(node.ay * dpr), pw, ph, 0, 0, pw, ph);
            return out.toBuffer('image/png');
        }
        catch (e) {
            console.warn('[flux-desktop] snapshot failed: ' + (e && e.message ? e.message : e));
            return null;
        }
    }
    dispatchOnLayout() {
        const visit = (n) => {
            const cb = n.props && n.props.onLayout;
            if (typeof cb === 'function') {
                const prev = this.layoutRects.get(n.id);
                const cur = { x: Math.round(n.x), y: Math.round(n.y), w: Math.round(n.w), h: Math.round(n.h) };
                if (!prev || prev.x !== cur.x || prev.y !== cur.y || prev.w !== cur.w || prev.h !== cur.h) {
                    this.layoutRects.set(n.id, cur);
                    cb({ nativeEvent: { layout: cur } });
                    setTimeout(scheduler_1.scheduleFrame, 0);
                }
            }
            else if (this.layoutRects.has(n.id)) {
                this.layoutRects.delete(n.id);
            }
            const cbAbs = n.props && n.props.onLayoutAbs;
            if (typeof cbAbs === 'function') {
                const prev = this.layoutAbsRects.get(n.id);
                const cur = { x: Math.round(n.ax), y: Math.round(n.ay), w: Math.round(n.w), h: Math.round(n.h) };
                if (!prev || prev.x !== cur.x || prev.y !== cur.y || prev.w !== cur.w || prev.h !== cur.h) {
                    this.layoutAbsRects.set(n.id, cur);
                    cbAbs({ nativeEvent: { layout: cur } });
                    setTimeout(scheduler_1.scheduleFrame, 0);
                }
            }
            else if (this.layoutAbsRects.has(n.id)) {
                this.layoutAbsRects.delete(n.id);
            }
            for (const c of n.children)
                visit(c);
        };
        visit(this.root);
    }
    /**
     * 滚动条带缓存判定：本帧是否为「纯滚动帧」——除恰好一个滚动容器的 scrollY 变了以外，
     * 场景树/外部资源/交互态全部静止。任何一条不满足就放弃（返回 null，走整帧重绘 = 旧行为）。
     * 必须在布局之后调用（吃最终的 scrollY/ax/ay/w/h）。无论返不返 plan 都提交本轮滚动快照。
     */
    planScrollBlit(dpr) {
        const skip = (why) => {
            this.blitSkip = why;
            return null;
        };
        if (process.env.FLUX_SCROLLBLIT === '0')
            return skip('off');
        if (this._destroyed || !this._ready)
            return skip('init');
        if (this.extDirty)
            return skip('ext');
        if ((0, painter_1.imagesPending)())
            return skip('img');
        // 常驻动画不再直接拒绝：动画视觉变更必然走 setState→touch→epoch，
        // 由下面的「脏节点全在视口内」共存模式承接；本帧无 touch 则场景真没变，blit 依然正确
        if (this.mouseDown || this.dragEd || this.lpTimer)
            return skip('mouse');
        if (this.hoverVisual)
            return skip('hover');
        if ((0, textinput_1.activeController)())
            return skip('caret');
        if ((0, contextmenu_1.getContextMenuState)().visible)
            return skip('menu');
        if ((0, textselect_1.getTextSelectionState)().visible)
            return skip('sel');
        const root = this.root;
        const dirty = (0, node_1.takeDirty)();
        const epochChanged = (root.__mutEpoch || 0) !== this.lastEpoch;
        if (epochChanged && dirty.length === 0)
            return skip('epoch'); // epoch 提前但无脏记录：保守全帧
        // 根级聚合标志由 collectLayout 刷在 root 的直接子节点上（root 自身不走 collectLayout）：
        // 任一直接子树含吸顶/浮层 → 其绘制盒会逸出滚动视口，条带底图搬不动它；含 video 同理
        for (const c of root.children) {
            if (!c.__noOverlay)
                return skip('overlay');
            if (c.__hasVideo)
                return skip('video');
        }
        // 快照：所有滚动节点的 {scrollX, scrollY, 视口盒}，并找出相对上一帧的变化者
        const cur = new Map();
        const visit = (n) => {
            if (n.kind === 'scroll')
                cur.set(n.id, { x: n.scrollX, y: n.scrollY, ax: n.ax, ay: n.ay, w: n.w, h: n.h });
            for (const c of n.children)
                visit(c);
        };
        visit(root);
        const changed = [];
        let ok = true;
        cur.forEach((v, id) => {
            const p = this.prevScrolls.get(id);
            if (!p)
                return; // 新挂载的滚动容器：没有底图可搬，不算变化
            if (p.x !== v.x || p.y !== v.y || p.ax !== v.ax || p.ay !== v.ay || p.w !== v.w || p.h !== v.h) {
                changed.push({ prev: p, node: root.children.length ? this.findNode(id) || root : root });
            }
        });
        if (cur.size !== this.prevScrolls.size)
            ok = false; // 有滚动容器被卸载
        this.prevScrolls = cur; // 所有早退路径也要提交：下一帧的比较基准永远是上一帧
        if (!ok)
            return skip('nodes');
        if (changed.length !== 1)
            return skip(changed.length === 0 ? 'noscroll' : 'multi');
        const node = changed[0].node;
        const v = cur.get(node.id);
        const p = changed[0].prev;
        // 被滚动的子树含图片 → 仅在「分数 DPI」下拒绝 blit 走全量帧：分数 DPI 下缩放图经 drawImage 重采样，图是硬像素边，
        // 整数行位移搬运的旧采样行与补画带按当前分数偏移重新采样的行在边界对不齐 → 每滚一步留一条等距细横线。
        // 但整数 dpr（如 2）下位移必为整数物理像素、blit 搬运像素精确、不产生 seam（已验证），故放行图片 blit 以恢复滚动流畅。
        // 文本因抗锯齿不可见故无碍；video 同理（见上 __hasVideo）。仅按本滚动子树判定，不误杀顶栏静态 Avatar。
        if (node.__hasImage && !Number.isInteger(dpr))
            return skip('image');
        if (p.ax !== v.ax || p.ay !== v.ay || p.w !== v.w || p.h !== v.h)
            return skip('box');
        if (v.x !== p.x)
            return skip('dx');
        const dy = v.y - p.y;
        if (Math.abs(dy) > v.h * 0.6)
            return skip('far'); // 跳滚（如锚点回顶）：重叠太小不值得搬
        const r = (0, flatten_1.getRadius)(node.style);
        if (r.tl || r.tr || r.br || r.bl)
            return skip('radius'); // 圆角视口 × 整数矩形补画区会留接缝/黑洞
        // 位移必须是整数物理像素：非整数 → drawImage 重采样模糊，且物理整数分区不再平铺无缝
        const d = Math.round(dy * dpr);
        if (Math.abs(dy * dpr - d) >= 1e-6)
            return skip('frac');
        if (d === 0)
            return skip('sub'); // 亚像素：光栅结果不变，重绘都省了也不对，交给全量保守处理
        if (this.surface && Math.abs(d) > Math.round(v.h * dpr) - 24 * dpr)
            return skip('depth');
        // 共存模式：场景本帧有变（动画/受控提交）但脏节点都能被矩形重画承接 → 照旧 blit。
        // 记录 {id, 上次绘制时的显示矩形, 当时所属滚动偏移 s}；旧态像素在本帧坐标系的位置：
        // 本子树随滚动位移 → q=[x, y-d]（d=本帧物理位移）；静态区（非滚动子孙） → q=[x, y]；
        // invariant：q 位移回本帧应等于当前矩形，否则节点真重排过 → 保守全帧。
        // 承接矩形与当前矩形：全在视口内 → 照旧；全在窗外 → 拒；跨边界/静区 → 都当静区重画区
        // （extra 在 S/C/R 之后刷；但静区补拷在先，extra 盖得住 → 无问题）。
        // 无记录 = 种子化：已显示面就是前帧态且无旧像素可抹，只重画当前矩形；
        // full 帧后保留记录不清：invariant 自会筛掉被重排改位的旧记录。
        const extra = [];
        const keep = [];
        if (epochChanged) {
            const vx0 = Math.round(v.ax * dpr);
            const vy0 = Math.round(v.ay * dpr);
            const vw0 = Math.round(v.w * dpr);
            const vh0 = Math.round(v.h * dpr);
            const Win = Math.round(this.faces[0].w * dpr);
            const Hin = Math.round(this.faces[0].h * dpr);
            if (dirty.length > 6)
                return skip('many');
            const saved = new Map(this.coexistRects.map((r) => [r.id, r]));
            // 最近 scroll 祖先（含自身）：记录时属于本帧滚动子树 → 旧态像素随位移 -d；否则原地
            const nearestScroll = (dn) => {
                for (let n = dn; n; n = n.parent)
                    if (n.kind === 'scroll')
                        return n;
                return null;
            };
            const inWinZone = (x, y, w, h) => x >= 0 && y >= 0 && x + w <= Win && y + h <= Hin;
            let area = 0;
            for (const dn of dirty) {
                if (!dn.parent && dn !== node)
                    return skip('gone'); // 已摘除：重排后旧位置无法定位
                if (dn.style && dn.style.transform)
                    return skip('xf'); // transform 逸出布局盒：不共存
                const rx = Math.round(dn.ax * dpr);
                const ry = Math.round(dn.ay * dpr);
                const rw = Math.round(dn.w * dpr);
                const rh = Math.round(dn.h * dpr);
                if (rw <= 0 || rh <= 0)
                    continue;
                const rec0 = saved.get(dn.id);
                // 陈旧记录（隔了帧：离屏期/静止期未刷新）：旧态早不在记录位置（或被位移链盖新），不可用于抹除
                const rec = rec0 && this.coexistFrame - rec0.f <= 1 ? rec0 : undefined;
                const sAn = nearestScroll(dn);
                // 脏节点不在本帧滚动的视口内（静区/异滚动子树）→ 保守全帧。
                // 静区色变（如右侧锚点 activeHref 高亮切换：蓝↔灰）若走 coexist，extra 只重画当帧目标面，
                // 而 facesOutOfSync=false 使 paintScrollBlit 不再补拷静区 → 另一张乒乓面收不到「取消高亮」的重画，
                // 旧蓝像素跨帧冻结成残影（实测：逻辑仅 1 项蓝，屏幕累积 2-3 项蓝）。锚点仅跨段瞬变，代价可忽略。
                if (sAn !== node)
                    return skip('static');
                const follows = rec !== undefined && sAn === node && rec.s === node.id;
                // 旧态抹除矩形（blit 坐标系）：随滚子树 → [rec.x, rec.y-d]；静态 → [rec.x, rec.y]。
                // 静区补拷/位移贴图都先于 extra 重画 → 跨视口边界无需拒绝；S/C/R 盖掉多余 extra 无害
                const qy = rec ? (follows ? rec.y - d : rec.y) : 0;
                if (rec && !follows && (Math.abs(rec.x - rx) > 1 || Math.abs(rec.y - ry) > 1)) {
                    return skip('moved'); // 静态记录却挪了位：发生过未记账的滚动/重排 → 旧态承接不成立
                }
                // 重画区与屏幕求交：完全离屏（滚动内容里未可见的动画行）→ 像素无差，整节点跳过；
                // 部分可见 → 只刷可见部分（painter 按带裁剪，与全量帧同像素）；
                // 不可见期不更新记录：下次露出时拿「最后一次可见位置」抹旧像素，正好是鬼影承接需要的
                const cx0 = Math.max(0, rx);
                const cy0 = Math.max(0, ry);
                const cx1 = Math.min(Win, rx + rw);
                const cy1 = Math.min(Hin, ry + rh);
                if (cx1 > cx0 && cy1 > cy0) {
                    if (rec) {
                        const ex0 = Math.max(0, rec.x);
                        const ey0 = Math.max(0, qy);
                        const ex1 = Math.min(Win, rec.x + rec.w);
                        const ey1 = Math.min(Hin, qy + rec.h);
                        if (ex1 > ex0 && ey1 > ey0) {
                            extra.push([ex0, ey0, ex1 - ex0, ey1 - ey0]);
                            area += (ex1 - ex0) * (ey1 - ey0);
                        }
                    }
                    extra.push([cx0, cy0, cx1 - cx0, cy1 - cy0]);
                    keep.push({ id: dn.id, x: rx, y: ry, w: rw, h: rh, s: sAn ? sAn.id : -1, f: this.coexistFrame + 1 });
                    area += (cx1 - cx0) * (cy1 - cy0);
                }
            }
            if (area > vw0 * vh0 * 0.35 + Win * Hin * 0.05)
                return skip('area'); // 重画面积接近整屏就不值得了
            this.__coexistHits += 1;
        }
        this.blitSkip = '';
        return { node, dy, extra, keep };
    }
    /**
     * 条带帧绘制：视口整数位移贴图（1 op，读已显示面写另一面）→ 三块互不重叠的补画区
     * 各自 clearRect + clip + paintTree({noClear,band})。无底图整拷：target 视口区被
     * 位移+S/C/R 完全覆盖；视口外静区只在 facesOutOfSync（上一帧是全量帧）时从已显示面
     * 补拷四边矩形。矩形全部物理整数切分：半像素接缝只能靠整数分区根除。
     * 分区（以 d>0 上滚为例，d=物理位移）：S=新露出的底部窄条、C=右侧滚动条列上段（擦旧拇指）、
     * R=右下角（拇指随滚动下移，只有列内重画能擦旧拇指）。
     */
    paintScrollBlit(target, shown, dpr, plan) {
        const ctx = target.ctx;
        const srcCanvas = shown.canvas;
        const node = plan.node;
        const d = Math.round(plan.dy * dpr);
        const vx = Math.round(node.ax * dpr);
        const vy = Math.round(node.ay * dpr);
        const vw = Math.round(node.w * dpr);
        const vh = Math.round(node.h * dpr);
        const SB = Math.ceil(12 * dpr); // 滚动条列宽：T=4 + 边距 2 + 抗锯齿余量
        // 位移贴图：目标行 y ← 源行 y+dy·dpr（内容上移）⇒ 源矩形取视口下段、写到目标上段，
        // 未覆盖的目标条 = 底部 d（d>0）/ 顶部 −d（d<0），即补画区 S
        const s0 = d > 0 ? vy + vh - d : vy; // S 上界（d<0 时 S 在顶部，上界就是视口顶）
        const e = d > 0 ? vy + vh : vy + vh - d; // S 下界
        // ⚠️ 绝不让 target/shown 同画：同画布重叠自拷贝在 napi 实现里方向不可靠
        //    （向下位移逐行先写后读 → 冻结/错位）；两面乒乓 + 读已显示面永远异画安全
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.facesOutOfSync) {
            // 视口外静区四边矩形同步（整数切分无缝）：上一帧是全量帧 → 另一面静区可能过期
            const W = target.canvas.width;
            const H = target.canvas.height;
            const statics = [
                [0, 0, W, vy],
                [0, vy + vh, W, H - vy - vh],
                [0, vy, vx, vh],
                [vx + vw, vy, Math.max(0, W - vx - vw), vh],
            ];
            for (const [rx, ry, rw, rh] of statics) {
                if (rw <= 0 || rh <= 0)
                    continue;
                ctx.drawImage(srcCanvas, rx, ry, rw, rh, rx, ry, rw, rh);
            }
        }
        // 视口内容整体位移：只搬两矩形交集（源=已显示面未移位态）
        if (d > 0)
            ctx.drawImage(srcCanvas, vx, vy + d, vw, vh - d, vx, vy, vw, vh - d);
        else
            ctx.drawImage(srcCanvas, vx, vy, vw, vh + d, vx, vy - d, vw, vh + d);
        const regions = [
            [vx, s0, vw, e - s0], // S：新露出条（含旧边缘 sliver）
            d > 0
                ? [vx + vw - SB, vy, SB, Math.max(0, Math.min(s0, vy + vh - SB) - vy)] // C：上段，擦旧拇指（新拇指在下方 S 内重画）
                : [vx + vw - SB, vy, SB, Math.max(0, Math.min(e, vy + vh - SB) - vy)], // C：上段（d<0 拇指上移，旧拇指在 e 之下、S 内重画）
            d > 0
                ? [vx, Math.max(s0, vy + vh - SB), vw - SB, vy + vh - Math.max(s0, vy + vh - SB)] // R：右下角（避开 S 已覆盖的底部窄条）
                : [vx, e, vw - SB, Math.max(0, vy + vh - SB - e)], // R：左列底部窄条（避开 S 已覆盖的顶部条与 C 已覆盖的列上段）
            ...plan.extra, // 共存模式：本帧脏节点矩形 + 上一 coexist 帧记录位移后的旧矩形
        ];
        for (const [rx, ry, rw, rh] of regions) {
            if (rw <= 0 || rh <= 0)
                continue;
            ctx.clearRect(rx, ry, rw, rh);
            ctx.beginPath();
            ctx.rect(rx, ry, rw, rh);
            ctx.save();
            ctx.clip();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            (0, painter_1.paintTree)(ctx, this.root, dpr, {
                noClear: true,
                band: { x0: rx / dpr, y0: ry / dpr, x1: (rx + rw) / dpr, y1: (ry + rh) / dpr },
            });
            ctx.restore(); // 回 identity
        }
        ctx.restore(); // 回建画布时的 dpr 变换（与全量帧后状态一致）
    }
    /** 记一笔「本帧已上屏」：CPU 路径贴屏后、GPU 路径 flush 后各调一次。 */
    _notePresented() {
        const t = Date.now();
        if (this._fpsSecStart === 0) {
            this._fpsSecStart = t;
            this._fpsSecFrames = 1;
            return;
        }
        this._fpsSecFrames += 1;
        const dt = t - this._fpsSecStart;
        if (dt >= 500) {
            this._fps = (this._fpsSecFrames * 1000) / dt;
            this._fpsSecFrames = 0;
            this._fpsSecStart = t;
        }
    }
    /** 对外接口：本窗当前帧率（每秒实际上屏帧数，四舍五入）。空闲（>1s 无新帧）返回 0。 */
    getFps() {
        if (this._fpsSecStart === 0)
            return 0;
        if (Date.now() - this._fpsSecStart > 1000)
            return 0;
        return Math.round(this._fps);
    }
    /** 计算本窗滚动签名：遍历滚动节点累加 scrollX/scrollY（滚动不经 epoch 的兜底）。仅静止候选帧调用。 */
    computeScrollSig() {
        let h = 0;
        const visit = (n) => {
            if (n.kind === 'scroll') {
                h = (Math.imul(h, 31) + (n.id | 0) + Math.round(n.scrollX) + Math.round(n.scrollY * 4)) | 0;
            }
            for (const c of n.children)
                visit(c);
        };
        visit(this.root);
        return h;
    }
    renderFrame() {
        const dbg = !!process.env.FLUX_DEBUG;
        const now = () => (dbg ? Number(process.hrtime.bigint()) / 1e6 : 0);
        const t0 = now();
        if (!this._ready)
            return;
        const w = this._logicalW;
        const h = this._logicalH;
        if (w <= 0 || h <= 0)
            return;
        const dpr = this.dpr();
        // 窗口节点本身作为布局根，尺寸锁定为可视区
        // resized：先比对再覆盖 lastSize（先前写在赋值后比较 → 恒 false，尺寸守卫形同虚设）
        const resized = !this.lastSize || this.lastSize.w !== w || this.lastSize.h !== h;
        this.lastSize = { w, h };
        this.root.w = w;
        this.root.h = h;
        this.root.x = 0;
        this.root.y = 0;
        this.root.ax = 0;
        this.root.ay = 0;
        if (resized) {
            // 尺寸 setter 只在真变过时隔 Yoga 标脏：每帧无脑 set 会让大树每帧全量重排
            this.root.yoga.setWidth(w);
            this.root.yoga.setHeight(h);
        }
        (0, node_1.applyScrollSemantics)(this.root); // 受控 scrollY 同步 + 首见子节点 flexShrink 守卫（均不弄脏 Yoga）
        // 空闲窗跳帧（多窗口卡顿根治）：scheduleFrame 是全局广播——任一窗 commit/动画/悬停都会让所有窗跑
        //   renderFrame，而本函数原本无条件 collectLayout+paintTree+present，背景静止窗因此白白全量重绘。
        //   此处在其之前判定「本窗自上次贴屏后逐像素必不变」则直接 return。判据全保守：任一动态信号命中即
        //   照常重绘（尺寸变/外部脏/未首帧/内容 epoch 变/交互态/浮层/光标/视频/待解码图/滚动签名变）。FLUX_IDLE_SKIP=0 可整体关闭。
        if (process.env.FLUX_IDLE_SKIP !== '0' && !resized && !this.extDirty && this._readyFired) {
            const dynamic = (this.root.__mutEpoch || 0) !== this.lastEpoch ||
                !!(this.mouseDown || this.dragEd || this.lpTimer || this.hoverVisual || this.pendingDrag || this._moveT) ||
                (0, contextmenu_1.getContextMenuState)().visible ||
                (0, textselect_1.getTextSelectionState)().visible ||
                !!(0, textinput_1.activeController)() ||
                this.root.children.some((c) => c.__hasVideo) ||
                (0, painter_1.imagesPending)() ||
                (0, painter_1.getImageGen)() !== this.lastImageGen;
            if (dynamic) {
                this._scrollSig = null; // 活动期作废基线，静止后重算
            }
            else {
                const sig = this.computeScrollSig();
                if (this._scrollSig !== null && sig === this._scrollSig)
                    return; // 完全静止：跳过重排+重绘+贴屏
                this._scrollSig = sig; // 纯滚动等未推 epoch 的变化：刷基线后照常重绘
            }
        }
        // 布局门控：只有「布局脏」（结构/布局类样式/文本变化才推 __layEpoch）或窗口尺寸变化才跑 Yoga。
        // 常驻动画（opacity/transform/颜色）只推 __mutEpoch 不推 __layEpoch → 动画期不再每帧全量重排（实测省 20-35ms/帧）。
        // collectLayout 每帧照跑：scrollY 变了子树 ax/ay 必须重算，命中测试/绘制都吃它
        const layEpoch = this.root.__layEpoch || 0;
        if (resized || layEpoch !== this.lastLayoutEpoch) {
            (0, yoga_1.calculateLayout)(this.root.yoga, w, h);
            this.lastLayoutEpoch = layEpoch;
            this.__layoutRuns = (this.__layoutRuns || 0) + 1;
        }
        this.__frameCount = (this.__frameCount || 0) + 1;
        for (const c of this.root.children)
            (0, node_1.collectLayout)(c, 0, 0);
        const tLayout = now();
        // ---- GPU 直绘路径（跳过 CPU faces/blit，直接写 GPU surface） ----
        if (this._gpuMode && this._gpuCtx) {
            try {
                const ctx = this._gpuCtx;
                // 清屏：取主题背景色
                const dark = app_1.Application.config.getTheme().dark;
                const gp0 = process.env.FLUX_GPU_DIAG ? Number(process.hrtime.bigint()) / 1e6 : 0;
                ctx.clearAll(dark ? 20 : 255, dark ? 20 : 255, dark ? 20 : 255, 255);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                (0, painter_1.paintTree)(ctx, this.root, dpr);
                ctx.flush();
                this._notePresented(); // GPU 直呈：flush+swap 后计一笔上屏帧
                if (process.env.FLUX_GPU_DIAG) {
                    const gp1 = Number(process.hrtime.bigint()) / 1e6;
                    const st = this;
                    st.__gpuFrameN = (st.__gpuFrameN || 0) + 1;
                    st.__gpuFrameAcc = (st.__gpuFrameAcc || 0) + (gp1 - gp0);
                    if (st.__gpuFrameN % 30 === 0) {
                        console.error(`[gpudiag] frames=${st.__gpuFrameN} avgPaintFlush=${(st.__gpuFrameAcc / 30).toFixed(1)}ms`);
                        st.__gpuFrameAcc = 0;
                    }
                }
                this.dispatchOnLayout();
                this.lastEpoch = this.root.__mutEpoch || 0;
                this.lastImageGen = (0, painter_1.getImageGen)();
                if (!this._readyFired) {
                    this._readyFired = true;
                    this._fire(this._cbs.ready);
                }
                return;
            }
            catch (e) {
                // GPU 绘制失败（硬件/驱动问题）：降级回 CPU
                console.warn('[flux] GPU render failed, falling back to CPU: ' + (e?.message || e));
                this._gpuMode = false;
                this._gpuCtx = null;
            }
        }
        // ---- CPU 路径（faces + scroll blit 优化） ----
        const f0 = this.faces[0];
        if (!f0 || f0.w !== w || f0.h !== h || f0.dpr !== dpr) {
            this.faces = [
                { ...(0, painter_1.createSurface)(w, h, dpr), w, h, dpr },
                { ...(0, painter_1.createSurface)(w, h, dpr), w, h, dpr },
            ];
            this.lastShownIdx = -1;
            this.shownCanvas = null;
            this.surface = null;
            this.prevScrolls.clear();
            this.lastEpoch = -1; // 尺寸刚变：底图作废
            this.lastImageGen = -1; // 同上：强制下一帧认脏（重建三面 + 全量重绘）
            this.facesOutOfSync = true;
            this.extDirty = true; // 下一帧强制全量（三面同时重建）
        }
        const plan = this.planScrollBlit(dpr);
        let target;
        if (plan) {
            // 读已显示面、写另一面：异画布位移，无同画自拷贝风险；无每帧 mirror 回刷
            const shownIdx = this.lastShownIdx === -1 ? 0 : this.lastShownIdx;
            const nextIdx = shownIdx === 0 ? 1 : 0;
            target = this.faces[nextIdx];
            this.paintScrollBlit(target, this.faces[shownIdx], dpr, plan);
            this.lastShownIdx = nextIdx;
            this.facesOutOfSync = false; // 两面静区自此对齐已显示帧（纯 blit 期间静区无人碰）
            this.coexistFrame += 1;
            // 未脏的存量记录仍有效（它们没被重画，位置也没变）：并入，防链被静止帧冲掉
            const kept = new Map(this.coexistRects.map((r) => [r.id, r]));
            for (const r of plan.keep)
                kept.set(r.id, { ...r, f: this.coexistFrame });
            this.coexistRects = Array.from(kept.values());
        }
        else {
            const nextIdx = this.lastShownIdx === 0 ? 1 : this.lastShownIdx === 1 ? 0 : 0;
            target = this.faces[nextIdx];
            const { canvas, ctx } = target;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            (0, painter_1.paintTree)(ctx, this.root, dpr);
            this.lastShownIdx = nextIdx;
            this.facesOutOfSync = true; // 场景动过：另一面静区不再可信，下次 blit 前补拷四边
            // coexistRects 不清：全量帧把所有脏节点画对了，记录仍是真位置；
            // 被重排改位的旧记录由 invariant（moved 闸）在下一 coexist 帧自动筛除
        }
        this.surface = target;
        this.shownCanvas = target.canvas;
        if (plan)
            this.__blitFrames++;
        else
            this.__fullFrames++;
        const { canvas, ctx } = target;
        const tPaint = now();
        this.dispatchOnLayout();
        const tDispatch = now();
        // 直接把画布交给平台层贴屏（WinitWindow.present 内部走原始 RGBA + 最近邻缩放到物理）
        this.win.present(canvas);
        this._notePresented(); // CPU 路径：贴屏后计一笔上屏帧
        this.lastEpoch = this.root.__mutEpoch || 0;
        this.lastImageGen = (0, painter_1.getImageGen)();
        if (!this._readyFired) {
            this._readyFired = true; // 首帧成功贴屏：生命周期「加载完成」
            this._fire(this._cbs.ready);
        }
        if (!plan)
            this.extDirty = false; // 外部脏只保一帧：整帧重绘后消化完毕
        if (dbg) {
            const tEnd = now();
            const gap = this._prevFrameEnd ? tEnd - this._prevFrameEnd : 0;
            this._prevFrameEnd = tEnd;
            const bm = (0, painter_1.bitmapStats)();
            const ics = (0, painter_1.imageCacheStats)();
            const r = (x) => Math.round(x);
            // WinitWindow.present 顺手记录本次 data()/贴屏 拆分耗时（契约外诊断字段，非底座实现没有就显 -）
            const stat = this.win;
            const split = typeof stat.lastDataMs === 'number'
                ? ` data=${r(stat.lastDataMs)} paste=${r(stat.lastPasteMs ?? 0)}`
                : '';
            console.log(`[frame] gap=${r(gap)} mode=${plan ? 'blit' : 'full'}${plan || !this.blitSkip ? '' : ' skip=' + this.blitSkip} layout=${r(tLayout - t0)} paint=${r(tPaint - tLayout)} dispatch=${r(tDispatch - tPaint)} blit=${r(tEnd - tDispatch)}${split} total=${r(tEnd - t0)}ms bm=${bm.bake}/${bm.hit} img=${(ics.bytes / 1048576).toFixed(1)}MB/${ics.count} ${canvas.width}x${canvas.height} dpr=${dpr}`);
            // 【临时诊断】每 120 帧：按 kind 统计节点数 + 找 children 最多的父节点及其祖先链（定位泄漏容器）
            this._dbgN++;
            if (this._dbgN % 120 === 0) {
                const hist = {};
                let fat = null;
                const walk2 = (n) => {
                    hist[n.kind] = (hist[n.kind] || 0) + 1;
                    if (!fat || n.children.length > fat.children.length)
                        fat = n;
                    for (const c of n.children)
                        walk2(c);
                };
                walk2(this.root);
                const fatNode = fat;
                const fp = [];
                for (let n = fatNode; n; n = n.parent) {
                    const tid = n.props && n.props.testID ? '#' + n.props.testID : '';
                    fp.unshift(n.kind + tid);
                }
                // 胖节点 style 指纹 + 子节点签名（前 12）+ 在父中位置：识别这些泄漏 View 到底是什么
                const fs = (fatNode && fatNode.style) || {};
                const styleSig = `pos=${fs.position || '-'} wh=${fs.width ?? 'auto'}x${fs.height ?? 'auto'} flex=${fs.flex ?? '-'} dir=${fs.flexDirection || '-'} oflow=${fs.overflow || '-'} disp=${fs.display ?? '-'}`;
                const kids = (fatNode ? fatNode.children : []).slice(0, 12).map((c) => {
                    const t = c.text ? `"${String(c.text).slice(0, 8)}"` : '';
                    return `${c.kind}${t}(${c.children.length})`;
                });
                const par = fatNode && fatNode.parent;
                const idx = par ? par.children.indexOf(fatNode) : -1;
                console.log(`[tree] ${JSON.stringify(hist)} fat=${fatNode ? fatNode.children.length : 0} idx=${idx} path=${fp.join('>')}`);
                console.log(`[fat] ${styleSig} kids=[${kids.join(' ')}...]`);
            }
        }
        // 整树 layout dump 单独开关：逐帧 console 输出会污染帧时测量，只在查布局问题时开
        if (process.env.FLUX_DEBUG_DUMP) {
            const dump = (n, depth) => {
                const pad = '  '.repeat(depth);
                const label = n.kind === 'text' ? JSON.stringify((n.text || '').slice(0, 12)) : '';
                console.log(`${pad}[${n.kind}] ${Math.round(n.ax)},${Math.round(n.ay)} ${Math.round(n.w)}x${Math.round(n.h)} ${label}`);
                for (const c of n.children)
                    dump(c, depth);
            };
            console.log('>>> layout dpr=' + dpr);
            dump(this.root, 0);
        }
    }
    /** 窗口销毁/关闭：摘帧任务。最后一个窗口关闭后无 setInterval，Node 自然退出。 */
    onWindowClosed() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        // 关窗回调同步触发（本处已在事件回调栈、非 commit 期；且末窗关即退进程，延后会丢）
        if (typeof this._cbs.close === 'function') {
            try {
                this._cbs.close();
            }
            catch {
                /* ignore */
            }
        }
        if (this.unsubscribeTheme) {
            this.unsubscribeTheme();
            this.unsubscribeTheme = null;
        }
        app_1.Application.unregister(this.windowId()); // 摘出 Application 注册表 + 模态栈（模态锁随之解除）
        this.unregister();
    }
    // ---- 运行时窗口控制（供 Application.get(id).host.xxx 命令式调用）----
    /** 设/取消用户拖拽缩放（实现层不支持则静默） */
    setResizable(v) {
        this.win.setResizable?.(!!v);
    }
    /** 当前是否可缩放（无实现按 true） */
    isResizable() {
        return this.win.isResizable ? this.win.isResizable() : true;
    }
    /** 设最小内尺寸（逻辑像素）：任一维留空 = 该维不设，两者都空 = 清除 */
    setMinSize(w, h) {
        this.win.setMinSize?.(w, h);
    }
    /** 设最大内尺寸（逻辑像素）：语义同 setMinSize */
    setMaxSize(w, h) {
        this.win.setMaxSize?.(w, h);
    }
    /** 以逻辑像素设定窗口内尺寸 */
    setSize(w, h) {
        this.win.setSize?.(w, h);
    }
    /** 设/取消标题栏与边框（false = 无标题无边框） */
    setDecorations(v) {
        this.win.setDecorations?.(!!v);
    }
    /** 当前是否有标题栏/边框（无实现按 true） */
    isDecorated() {
        return this.win.isDecorated ? this.win.isDecorated() : true;
    }
    /** 最大化 / 还原 */
    setMaximized(v) {
        this.win.setMaximized?.(!!v);
    }
    /** 快捷最大化 */
    maximize() {
        this.setMaximized(true);
    }
    /** 快捷还原（取消最大化） */
    restore() {
        this.setMaximized(false);
    }
    /** 当前是否最大化（无实现按 false） */
    isMaximized() {
        return this.win.isMaximized ? this.win.isMaximized() : false;
    }
    /** 最小化 / 从最小化恢复 */
    setMinimized(v) {
        this.win.setMinimized?.(!!v);
    }
    /** 快捷最小化到任务栏 */
    minimize() {
        this.setMinimized(true);
    }
    /** 唤醒并前置本窗：从最小化恢复 + 抢前台焦点（配合单实例「重复打开唤起老 App」）。
     *  native 不支持 focusWindow 时回落为仅 setMinimized(false)（至少从任务栏恢复）。 */
    focus() {
        if (this.win.focusWindow)
            this.win.focusWindow();
        else
            this.win.setMinimized?.(false);
    }
    /** 运行时把窗口在主显示器居中 */
    center() {
        this.win.center?.();
    }
    /** 以逻辑坐标移动窗口到 (x, y)（外框左上角） */
    setPosition(x, y) {
        this.win.setPosition?.(x, y);
    }
    /** 主显示器尺寸与原点（逻辑像素）：无实现返回全 0 */
    getMonitorSize() {
        return this.win.monitorSize ? this.win.monitorSize() : { x: 0, y: 0, w: 0, h: 0 };
    }
    /** 本窗当前 DPI 缩放因子（resize/ScaleFactorChanged 持续更新）；未就绪时为 1 */
    getScale() {
        return this._nativeScale > 0 ? this._nativeScale : 1;
    }
    /** 读窗口当前状态：可缩放 / 最大化 / 有无边框 + 外框坐标与内尺寸（逻辑像素）。innerSize/getPosition 不可用时回落最后已知值 */
    getWindowState() {
        const s = this.win.innerSize ? this.win.innerSize() : { w: this._logicalW, h: this._logicalH };
        const p = this.win.getPosition ? this.win.getPosition() : { x: 0, y: 0 };
        return {
            resizable: this.isResizable(),
            maximized: this.isMaximized(),
            decorated: this.isDecorated(),
            x: p.x,
            y: p.y,
            w: s.w,
            h: s.h,
        };
    }
    close() {
        this.unregister();
        this.win.close();
    }
}
exports.WindowHost = WindowHost;
