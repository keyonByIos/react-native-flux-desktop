import { FlatStyle } from '../style/flatten';
export type NodeKind = 'view' | 'text' | 'image' | 'video' | 'icon' | 'window' | 'scroll';
export interface SceneNode {
    id: number;
    kind: NodeKind;
    props: Record<string, any>;
    style: FlatStyle;
    /** kind === 'text' 时的文本内容 */
    text: string;
    /** Yoga 节点（布局用） */
    yoga: any;
    parent: SceneNode | null;
    children: SceneNode[];
    /** React hide/unhide 语义 */
    visible: boolean;
    /** 布局结果（逻辑像素，每帧由 calculateAll 刷新） */
    x: number;
    y: number;
    w: number;
    h: number;
    /** 视口绝对坐标（布局后递归累加，供命中测试用） */
    ax: number;
    ay: number;
    /** 滚动偏移（仅 kind === 'scroll' 有意义），影响子节点的 ax/ay 与绘制位移 */
    scrollX: number;
    scrollY: number;
    /**
     * 视口剔除安全标志（每帧由 collectLayout 自底向上刷新）：
     * true = 本节点及其整棵子树都不含 zIndex>0 浮层与 transform，绘制盒不会逸出自身布局盒，
     * 可被 painter 按裁剪带整块剔除；false = 子树有逸出风险，永不整块剔除。
     */
    __cullClean?: boolean;
    /**
     * 子树无 zIndex>0 浮层（忽略 transform）：位图缓存的安全判据。
     * 浮层会被延迟到顶层另一趟绘制、不烘进本位图；而 transform 会被烘进位图（子节点旋转/缩放对缓存无害）。
     */
    __noOverlay?: boolean;
    /**
     * 子树最近一次变更的全局序号（由 reconciler 变更沿祖先链传播，见 touch）。
     * painter 的离屏位图缓存据此判定失效：本节点 __mutEpoch 变了 = 自身/后代改过 → 重烘。
     * 滚动（直写 scrollY、不经 reconciler）不会推高它 → 滚动期间缓存不失效。
     */
    __mutEpoch?: number;
    /**
     * 子树最近一次「布局脏」的全局序号（结构变更 / 布局类样式 / 文本内容变化才推）。
     * host 布局门控据此判定要不要跑 calculateLayout：常驻动画（opacity/transform/颜色）只推
     * __mutEpoch 不推它 → 动画帧不再每帧全量重排（大表格页省 20-35ms/帧）。
     */
    __layEpoch?: number;
    /** 离屏位图缓存句柄（仅带 style.cacheAsBitmap 且子树干净的节点使用）；null=本帧判定不可缓存 */
    __bm?: {
        canvas: any;
        ctx: any;
        w: number;
        h: number;
        epoch: number;
        gen: number;
    } | null;
    /** 子树含 video 节点（解码帧不经 epoch 上报）：host 滚动条带缓存据此拒绝增量帧 */
    __hasVideo?: boolean;
    /**
     * 子树含 image 节点：分数 DPI 下 drawImage 对缩放图重采样，图是硬像素边，
     * 整数行位移 blit 与补画带的重新采样行在边界对不齐 → 1px 鬼影横线（与 video 同类）。
     * host 滚动条带缓存据此对「被滚动的那棵子树」拒绝 blit、走全量重绘。
     */
    __hasImage?: boolean;
    /** 已对 Yoga 施加过 setFlexShrink(0)（滚动语义）：重复 set 会无谓标脏 → 每帧全量重排，故加守卫 */
    __shrinkOff?: boolean;
    /** 文本测量回调，由 reconciler 注入（依赖字体度量） */
    measure?: (width: number, widthMode: number, height: number, heightMode: number) => {
        width: number;
        height: number;
    };
    /**
     * 文本输入控制器：仅可编辑字段（Input/TextArea）经 ref 挂到自己节点上。
     * host 命中/键盘/IME 事件据此路由到当前聚焦字段（见 events/textinput.ts）。
     * 用内联 import 引类型，避免与 events 层形成运行时循环依赖。
     */
    __input?: import('../events/editable').EditableController;
}
/** 把节点及其祖先链的 __mutEpoch 刷成最新序号（O(深度)，供位图缓存判定子树是否变过） */
export declare function touch(node: SceneNode | null): void;
/** 取走并清空脏节点集（每帧由 host 消费一次；全量帧消费后即作废） */
export declare function takeDirty(): SceneNode[];
/**
 * 布局脏标记：把节点及其祖先链的 __layEpoch 刷成最新序号。
 * 只在影响布局的变更时调用（结构接卸/布局类样式/文本内容）；纯绘制变更（opacity/transform/颜色）
 * 只走 touch。复用 mutSeq 保证序号单调。
 */
export declare function touchLayout(node: SceneNode | null): void;
export declare function createSceneNode(kind: NodeKind, props?: Record<string, any>): SceneNode;
export declare function setProps(node: SceneNode, props: Record<string, any>): void;
/** 文本内容变化：更新 measureFunc 缓存并重算（Yoga 需要知道内容尺寸变了） */
export declare function setText(node: SceneNode, text: string): void;
export declare function appendChild(parent: SceneNode, child: SceneNode): void;
export declare function insertBefore(parent: SceneNode, child: SceneNode, before: SceneNode): void;
export declare function removeChild(parent: SceneNode, child: SceneNode): void;
/** 布局完成后把 Yoga 结果抄到节点上，并累加出视口绝对坐标 */
export declare function collectLayout(node: SceneNode, ox?: number, oy?: number): void;
/**
 * 滚动容器的直接子节点不参与主轴收缩。
 * RN 的 flexShrink 默认是 1，内容一旦超出容器就会被等比压扁；而 ScrollView 的
 * 语义是「按自然尺寸布局、超出部分靠滚动」，所以这里显式关掉收缩。
 * 每帧统一走一遍，避免在 attach / setProps 各处维持状态。
 */
export declare function applyScrollSemantics(node: SceneNode): void;
/** 滚动内容的总尺寸（用于算滚动上限） */
export declare function scrollContentSize(node: SceneNode): {
    w: number;
    h: number;
};
/** 深度优先遍历（绘制顺序 = 文档顺序，后者覆盖前者） */
export declare function walk(root: SceneNode, fn: (n: SceneNode, depth: number) => void, depth?: number): void;
