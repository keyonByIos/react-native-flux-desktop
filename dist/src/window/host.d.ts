import { SceneNode } from '../scene/node';
import type { PlatformWindow } from './platform';
export declare class WindowHost {
    readonly root: SceneNode;
    private win;
    private unregister;
    private pressed;
    private hovered;
    /** 左键按住态 + 按下时命中的可编辑字段：供拖动选词（mousemove 期间延伸 caret） */
    private mouseDown;
    private dragEd;
    /** in-app 拖拽：按下时命中的拖拽源（未越位移阈值前的候选）；越过则起拖，无移动即松手则当普通点击 */
    private pendingDrag;
    /** 静态文本长按选中会话：按住 500ms 不动即选中（命中 selectable 文本才启动） */
    private lpTimer;
    private lpNode;
    private lpStart;
    private lastSize;
    /** FLUX_GPU=1 且 GpuCtx2D 可用时为 true，renderFrame 走 GPU 直绘路径 */
    private _gpuMode;
    private _gpuCtx;
    /** GPU 拓帧钩子只排一次（首帧后 setTimeout 抓图） */
    private _gpuGrabScheduled;
    /** 双面画布乒乓：blit 永远「读已显示面、写另一面」（异画布，无 napi 同画布重叠自拷贝的行序陷阱）。
     *  target 的视口区被 位移拷贝+S/C/R 补画区完全覆盖，无需底图整拷；视口外静区仅在
     *  上一帧是全量帧（facesOutOfSync）时从已显示面补拷一次四边矩形 */
    private faces;
    /** 最近一帧展示内容落在 faces 哪一面（-1 = 无） */
    private lastShownIdx;
    /** 两面的视口外静区是否一致：全量帧后置 true（场景变了，另一面静区可能过期），blit 同步后清除 */
    private facesOutOfSync;
    /** 当前展示内容所在的物理画布（grab/snapshot 语义：最近一帧画面） */
    private shownCanvas;
    /** 旧 surface 别名：指向「上一帧所用绘制面」（grab/snapshot/尺寸判定沿用旧语义） */
    private surface;
    /** 上一帧 present 后的场景树变更序号；与当前不等 = 树动过 → 不可 blit */
    private lastEpoch;
    /** 上次跑过 calculateLayout 时的场景 epoch；不变 → 纯滚动帧跳过重排 */
    private lastLayoutEpoch;
    /** 上一帧各滚动节点的快照（scrollX/Y + 视口盒）；本帧恰好只有 1 个变化才 blit */
    private prevScrolls;
    /** 图片解码到位等外部脏：下一帧必须整帧重绘 */
    private extDirty;
    /** 空闲窗跳帧基线：上次贴屏时的滚动签名（滚动不经 __mutEpoch，用它兜住滚轮/受控/程序化滚动）；null=活动期已作废 */
    private _scrollSig;
    /** 空闲窗跳帧基线：上次贴屏时全局 imageGen。setImageReadyNotifier 是全局单例（后建窗覆盖），extDirty
     *  只能抵一窗；本窗不是宿主时，新图就绪不会推 epoch 也不会设 extDirty，仅靠 counter 变化识别——
     *  否则含图空闲窗会跳过那一帧，新图区域停在占位底图（横条元素呈一条横线残影）。-1 = 无效基线，下一帧强制重绘。*/
    private lastImageGen;
    /** 【临时诊断】帧计数：每 120 帧 dump 一次场景树 kind 直方图 + 最胖父节点路径，定位节点泄漏 */
    private _dbgN;
    /** 【临时诊断】[mem] 每 2s 时间驱动采样（静置也采）：rss/heap/ext/ab + 节点数 + 该窗口期帧数，区分高水位 vs 真泄漏 */
    private _memTimer;
    private _lastDbgN;
    /** 上一次收到连续 move 的目标（带 onMouseMove 的节点）：目标切换时对旧目标补发 onMouseMoveLeave */
    private _moveT;
    /** 悬停节点自带 hover/pressed 样式（绘制期直接生效，不经 epoch 上报）：blit 需回避 */
    private hoverVisual;
    /** 诊断用：本帧放弃 blit 的原因（帧日志 skip=） */
    private blitSkip;
    /** 共存模式记录：每帧脏节点重画后的矩形链；full 帧不清（陈旧由帧号距离筛） */
    private coexistRects;
    /** 共存模式帧号：只在 coexist blit 帧递增；记录 f 与本帧差 ≤1 = 上一 coexist 帧刚画过，旧态承接才可信 */
    private coexistFrame;
    /** 诊断计数：blit 帧 / 全量帧 / 共存帧（blit+脏重画）累计（像素一致性验证脚本校验「确实命中过」） */
    __blitFrames: number;
    __fullFrames: number;
    __coexistHits: number;
    /** 诊断计数：布局门控命中率（calculateLayout 实跑次数 / 总帧数） */
    __layoutRuns: number;
    __frameCount: number;
    private _ready;
    private _logicalW;
    private _logicalH;
    private _nativeScale;
    private _destroyed;
    /** 主题订阅退订句柄：换肤时同步窗口背景色，关窗时退订 */
    private unsubscribeTheme;
    /** 窗口生命周期回调（来自 <Window> props）：准备加载/加载中/加载完成/关闭；focused = 焦点变化（带布尔参） */
    private _cbs;
    /** 加载完成回调只触发一次（首帧贴屏后置位） */
    private _readyFired;
    /** 延后触发生命周期回调（避开 reconciler commit 期同步 setState 警告）；吞掉回调内异常。 */
    private _fire;
    constructor(root: SceneNode, win?: PlatformWindow);
    /**
     * 光栅倍率（dpr）：blit 成本随像素数平方增长，故留一个可封顶的开关。
     * 默认「跟随原生 scale」——不降采样，保证 present 走 1:1 无重采样（高分屏不糊）。
     * 封顶优先级：持久化偏好 App.prefs.resolution（非 0，百分）> env FLUX_MAX_DPR > 跟随原生。
     *   偏好排在 env 前：gallery 启动会用 app.json 的 maxDpr 无条件注入 env=默认上限，属「应用缺省」；
     *   用户在顶栏「渲染」手动选的分辨率应盖过应用缺省，故偏好优先（与 GPU 的 env>偏好 相反，因 GPU 的 env 是纯调试开关）。
     * ⚠️ 把封顶压到低于原生 scale 会让 present 做非整数倍最近邻上采样 → 边缘阶梯锯齿
     *    （scale=2 屏封顶 1.5 → 放大 2/1.5=1.333，实测斜线阶梯度恶化约 12×），故默认不再封顶。
     */
    private dpr;
    /** 本窗 platform id（注入的 mock 窗无 id → -1；Application 门控遇 -1 恒不拦） */
    private windowId;
    /**
     * 诊断：本窗渲染面 + 场景规模快照（供 MemMonitor 逐窗展示，纯只读不改状态）。
     * faces 存逻辑 w/h，物理像素 = round(w·dpr)×round(h·dpr)，每面 RGBA 4 字节，双缓冲 ×面数。
     * nodes = 从 root 递归计的场景节点数（近似本窗 React 树规模，供堆摊算用）。
     */
    getMemStats(): {
        w: number;
        h: number;
        dpr: number;
        faces: number;
        surfaceMB: number;
        nodes: number;
    };
    /** 模态门：存在活动模态窗且本窗非栈顶 → 本窗应吞掉交互输入（仍照常渲染） */
    private inputBlocked;
    private bindEvents;
    /** 键盘：仅按下驱动编辑；可见字符直接插入，命名键交聚焦字段处理 */
    private onKey;
    /** IME：preedit 驱动合成态（下划线候选），commit 把文本插入并结束合成 */
    private onIme;
    private onPress;
    /** 右键：命中可编辑字段→聚焦弹菜单；命中 selectable 静态文本→选中+复制菜单；否则收起。 */
    private onContextMenu;
    /** 菜单估算宽 200、高按项数估（每项 ~30 + 边距），贴边时往窗口内收 */
    private clampMenuPos;
    /** 从命中节点向上找最近开了 selectable 的静态文本节点（默认全关，须显式开启） */
    private findSelectable;
    /** 选中呈现：算行矩形写 store，弹「复制」菜单（长按到点/右键命中共用） */
    private presentSelection;
    /** 镜像 paintText 的排版：contentBox 起点 + layoutText 逐行宽，给多行文本算每行高亮矩形 */
    private selectionRects;
    private startLongPress;
    private cancelLongPress;
    private onRelease;
    private onMouseMove;
    private onMouseLeaveWindow;
    private onWheel;
    /** 只有真的用到 hover 样式才值得重绘整帧 */
    private usesHoverStyle;
    setCursor(shape: string): void;
    /** 截图：把最近一帧画布存成 PNG（Qt 版走 win.grab，这里直接用 Skia 画布） */
    grab(path: string): void;
    /**
     * GPU 直呈拓帧：shownCanvas 在 GPU 模式从未赋值，grab() 拿不到东西。本方法自带重绘→
     * flushSubmit(不 swap)→grabPixels(glReadPixels) → 用 @napi-rs/canvas 包成 PNG。不依赖 swap 时序。
     */
    gpuGrabTo(path: string): boolean;
    /** 按 id 在场景树找节点（getPublicInstance 把 SceneNode 直接交给 React ref，故组件 ref.current.id 可用） */
    findNode(id: number): SceneNode | null;
    /** 区域快照：从最近一帧画布裁出某节点的 PNG（物理像素 = 逻辑坐标 × dpr）。拿不到返 null。 */
    snapshotNode(node: SceneNode): Buffer | null;
    /**
     * onLayout 派发：布局结果与上次缓存不一致才回调，天然收敛，不会形成重渲染循环。
     */
    private layoutRects;
    private layoutAbsRects;
    private dispatchOnLayout;
    /**
     * 滚动条带缓存判定：本帧是否为「纯滚动帧」——除恰好一个滚动容器的 scrollY 变了以外，
     * 场景树/外部资源/交互态全部静止。任何一条不满足就放弃（返回 null，走整帧重绘 = 旧行为）。
     * 必须在布局之后调用（吃最终的 scrollY/ax/ay/w/h）。无论返不返 plan 都提交本轮滚动快照。
     */
    private planScrollBlit;
    /**
     * 条带帧绘制：视口整数位移贴图（1 op，读已显示面写另一面）→ 三块互不重叠的补画区
     * 各自 clearRect + clip + paintTree({noClear,band})。无底图整拷：target 视口区被
     * 位移+S/C/R 完全覆盖；视口外静区只在 facesOutOfSync（上一帧是全量帧）时从已显示面
     * 补拷四边矩形。矩形全部物理整数切分：半像素接缝只能靠整数分区根除。
     * 分区（以 d>0 上滚为例，d=物理位移）：S=新露出的底部窄条、C=右侧滚动条列上段（擦旧拇指）、
     * R=右下角（拇指随滚动下移，只有列内重画能擦旧拇指）。
     */
    private paintScrollBlit;
    /** 一帧：布局 → 绘制 → 贴图（present 到物理帧缓冲） */
    private _prevFrameEnd;
    private _fps;
    private _fpsSecFrames;
    private _fpsSecStart;
    /** 记一笔「本帧已上屏」：CPU 路径贴屏后、GPU 路径 flush 后各调一次。 */
    private _notePresented;
    /** 对外接口：本窗当前帧率（每秒实际上屏帧数，四舍五入）。空闲（>1s 无新帧）返回 0。 */
    getFps(): number;
    /** 计算本窗滚动签名：遍历滚动节点累加 scrollX/scrollY（滚动不经 epoch 的兜底）。仅静止候选帧调用。 */
    private computeScrollSig;
    private __fs;
    /** Phase 0 帧成本剖析：滞动窗口(30 帧)累计分段耗时/操作数，每满 30 帧输出一次 p50/p95/max + 三巨头占比。 */
    private _fsSample;
    renderFrame(): void;
    /** 窗口销毁/关闭：摘帧任务。最后一个窗口关闭后无 setInterval，Node 自然退出。 */
    private onWindowClosed;
    /** 设/取消用户拖拽缩放（实现层不支持则静默） */
    setResizable(v: boolean): void;
    /** 当前是否可缩放（无实现按 true） */
    isResizable(): boolean;
    /** 设最小内尺寸（逻辑像素）：任一维留空 = 该维不设，两者都空 = 清除 */
    setMinSize(w?: number | null, h?: number | null): void;
    /** 设最大内尺寸（逻辑像素）：语义同 setMinSize */
    setMaxSize(w?: number | null, h?: number | null): void;
    /** 以逻辑像素设定窗口内尺寸 */
    setSize(w: number, h: number): void;
    /** 设/取消标题栏与边框（false = 无标题无边框） */
    setDecorations(v: boolean): void;
    /** 当前是否有标题栏/边框（无实现按 true） */
    isDecorated(): boolean;
    /** 最大化 / 还原 */
    setMaximized(v: boolean): void;
    /** 快捷最大化 */
    maximize(): void;
    /** 快捷还原（取消最大化） */
    restore(): void;
    /** 当前是否最大化（无实现按 false） */
    isMaximized(): boolean;
    /** 最小化 / 从最小化恢复 */
    setMinimized(v: boolean): void;
    /** 快捷最小化到任务栏 */
    minimize(): void;
    /** 唤醒并前置本窗：从最小化恢复 + 抢前台焦点（配合单实例「重复打开唤起老 App」）。
     *  native 不支持 focusWindow 时回落为仅 setMinimized(false)（至少从任务栏恢复）。 */
    focus(): void;
    /** 运行时把窗口在主显示器居中 */
    center(): void;
    /** 以逻辑坐标移动窗口到 (x, y)（外框左上角） */
    setPosition(x: number, y: number): void;
    /** 主显示器尺寸与原点（逻辑像素）：无实现返回全 0 */
    getMonitorSize(): {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /** 本窗当前 DPI 缩放因子（resize/ScaleFactorChanged 持续更新）；未就绪时为 1 */
    getScale(): number;
    /** 本窗的 Win32 HWND（以 number 交出，供可选 view 渲染模块如 webview 包在其上挂子面）。
     *  非 Windows / mock 窗 / native 未就绪返回 0。逻辑坐标→物理像素换算请用 getScale()。 */
    getNativeHandle(): number;
    /** 读窗口当前状态：可缩放 / 最大化 / 有无边框 + 外框坐标与内尺寸（逻辑像素）。innerSize/getPosition 不可用时回落最后已知值 */
    getWindowState(): {
        resizable: boolean;
        maximized: boolean;
        decorated: boolean;
        x: number;
        y: number;
        w: number;
        h: number;
    };
    close(): void;
}
