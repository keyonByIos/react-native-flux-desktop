"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.touch = touch;
exports.takeDirty = takeDirty;
exports.touchLayout = touchLayout;
exports.createSceneNode = createSceneNode;
exports.setProps = setProps;
exports.setText = setText;
exports.appendChild = appendChild;
exports.insertBefore = insertBefore;
exports.removeChild = removeChild;
exports.collectLayout = collectLayout;
exports.applyScrollSemantics = applyScrollSemantics;
exports.scrollContentSize = scrollContentSize;
exports.walk = walk;
// 场景节点：自绘管线的宿主实例。React 操作的是这棵树，Qt 只负责最后贴一张图。
const flatten_1 = require("../style/flatten");
const yoga_1 = require("../layout/yoga");
let nextId = 1;
/** 全局变更序号：每次场景树突变自增，touch 把它盖到被改节点及其所有祖先 */
let mutSeq = 1;
/** 自上次 takeDirty 以来被 touch 的节点集：host 滚动共存模式据此判定「变化是否全在视口内」 */
const pendingDirty = new Set();
/** 把节点及其祖先链的 __mutEpoch 刷成最新序号（O(深度)，供位图缓存判定子树是否变过） */
function touch(node) {
    const e = mutSeq++;
    for (let n = node; n; n = n.parent)
        n.__mutEpoch = e;
    if (node)
        pendingDirty.add(node);
}
/** 取走并清空脏节点集（每帧由 host 消费一次；全量帧消费后即作废） */
function takeDirty() {
    if (pendingDirty.size === 0)
        return [];
    const a = Array.from(pendingDirty);
    pendingDirty.clear();
    return a;
}
/**
 * 布局脏标记：把节点及其祖先链的 __layEpoch 刷成最新序号。
 * 只在影响布局的变更时调用（结构接卸/布局类样式/文本内容）；纯绘制变更（opacity/transform/颜色）
 * 只走 touch。复用 mutSeq 保证序号单调。
 */
function touchLayout(node) {
    const e = mutSeq++;
    for (let n = node; n; n = n.parent)
        n.__layEpoch = e;
}
function createSceneNode(kind, props = {}) {
    const node = {
        id: nextId++,
        kind,
        props,
        style: (0, flatten_1.normalizeStyle)(props.style),
        text: '',
        yoga: (0, yoga_1.createYogaNode)(),
        parent: null,
        children: [],
        visible: true,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        ax: 0,
        ay: 0,
        scrollX: 0,
        scrollY: 0,
    };
    (0, yoga_1.applyStyleToNode)(node.yoga, node.style);
    return node;
}
/**
 * 值相等判（深度 1）：原始值 ===；数组逐元素同法；普通对象键集 + 值 ===。
 * 重渲染里内联字面量（style/hoverStyle/transform/source 等）每次都是新引用但值同，
 * 此比较把它们识别为「没变」。
 */
function sameVal(a, b) {
    if (a === b)
        return true;
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++)
            if (!sameVal(a[i], b[i]))
                return false;
        return true;
    }
    if (typeof a === 'object' && typeof b === 'object' && a && b) {
        const ka = Object.keys(a);
        const kb = Object.keys(b);
        if (ka.length !== kb.length)
            return false;
        for (const k of ka)
            if (!sameVal(a[k], b[k]))
                return false;
        return true;
    }
    return false;
}
/** 浅层键集 + 值相等（style / props 用，值走 sameVal） */
function sameFlat(a, b) {
    return sameVal(a, b) && !Array.isArray(a) && !Array.isArray(b);
}
/**
 * props 变化是否影响绘制（需推 epoch / 重设 Yoga）。
 * 排除项：children（宿主节点不吃，文本另有 setText 通道）；scrollX/scrollY（受控滚动同步不吃重绘，
 * 且 host 滚动条带缓存自己比对运行值）；函数值（回调重建不改画面，node.props 已换最新引用）。
 * ⚠️ 前提：绘制内容不取决于「同值但新引用的函数闭包」（render-prop 类）；当前无此用法，
 * 真出现时该节点应自报变更或去掉缓存资格。
 */
function propsAffectPaint(prev, next) {
    for (const k in next) {
        if (k === 'children' || k === 'style' || k === 'scrollX' || k === 'scrollY')
            continue;
        const v = next[k];
        if (typeof v === 'function')
            continue;
        if (!sameFlat0(prev[k], v))
            return true;
    }
    for (const k in prev) {
        if (k === 'children' || k === 'style' || k === 'scrollX' || k === 'scrollY')
            continue;
        if (!(k in next))
            return true; // 删键
    }
    return false;
}
function sameFlat0(a, b) {
    return sameVal(a, b);
}
/**
 * 纯绘制样式：只改像素不改布局。applyStyleToNode 不消费它们，变更时无需重设 Yoga，
 * 也不推 __layEpoch（host 布局门控据此跳 calculateLayout）。
 * 注：fontSize/lineHeight 虽不直接进 Yoga，但会改变 measureFunc 结果，保守归入布局类。
 */
const PAINT_ONLY_STYLE = new Set([
    'opacity',
    'transform',
    'backgroundColor',
    'color',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'borderEndColor',
    'borderStartColor',
    'shadowColor',
    'shadowOpacity',
    'shadowRadius',
    'shadowOffset',
    'zIndex',
    'cursor',
    'overflow',
    'elevation',
    'tint',
    'resizeMode',
]);
/** 两份扁平 style 的差异是否全在纯绘制键上（任一侧出现非 PAINT_ONLY 变更键 → true 布局脏） */
function styleDiffPaintOnly(prev, next) {
    for (const k in next) {
        if (!sameVal(prev[k], next[k]) && !PAINT_ONLY_STYLE.has(k))
            return false;
    }
    for (const k in prev) {
        if (!(k in next))
            return false; // 删键：applyStyleToNode 不会重置旧值，保守归布局脏
    }
    return true;
}
function setProps(node, props) {
    const prev = node.props;
    const nextStyle = (0, flatten_1.normalizeStyle)(props.style);
    const styleChanged = !sameFlat(node.style, nextStyle);
    node.props = props; // 回调引用永远取最新（即使本帧判定「没变」）
    let layoutDirty = false;
    if (styleChanged) {
        // 纯绘制样式（opacity/transform/颜色…）不重置 Yoga：重置会把整棵子树标脏，且 applyStyleToNode
        // 只应用布局键，重置也毫无意义；动画期避免的是把 Yoga 标脏引发全量重排
        layoutDirty = !styleDiffPaintOnly(node.style, nextStyle);
        node.style = nextStyle;
        if (layoutDirty) {
            (0, yoga_1.applyStyleToNode)(node.yoga, nextStyle); // 会按样式重置 flexShrink → 滚动守卫标志作废
            node.__shrinkOff = false;
        }
    }
    // no-op 免疫：重渲染里大量 commitUpdate 其实什么都没变，跳过 touch 才使滚动期 epoch 稳定（位图/条带缓存不失效）
    if (styleChanged || propsAffectPaint(prev, props))
        touch(node);
    if (layoutDirty)
        touchLayout(node);
}
/** 文本内容变化：更新 measureFunc 缓存并重算（Yoga 需要知道内容尺寸变了） */
function setText(node, text) {
    node.text = text;
    touch(node);
    touchLayout(node); // 文本尺寸可能变 → 布局脏
}
function indexOfChild(parent, child) {
    return parent.children.indexOf(child);
}
function appendChild(parent, child) {
    attachAt(parent, child, parent.children.length);
}
function insertBefore(parent, child, before) {
    const at = parent.children.indexOf(before);
    attachAt(parent, child, at < 0 ? parent.children.length : at);
}
/** 把 child 接到 parent 的第 at 位；跨父移动时先从旧父摘除（Yoga 树同步） */
function attachAt(parent, child, at) {
    if (child.parent === parent && parent.children[at] === child)
        return;
    if (child.parent) {
        const old = child.parent;
        old.children.splice(old.children.indexOf(child), 1);
        old.yoga.removeChild(child.yoga);
    }
    child.parent = parent;
    parent.children.splice(Math.max(0, Math.min(at, parent.children.length)), 0, child);
    parent.yoga.insertChild(child.yoga, Math.max(0, Math.min(at, parent.children.length - 1)));
    touch(parent);
    touchLayout(parent); // 结构变更 → 布局脏
}
function removeChild(parent, child) {
    const i = indexOfChild(parent, child);
    if (i < 0)
        return;
    parent.children.splice(i, 1);
    parent.yoga.removeChild(child.yoga);
    child.parent = null;
    detachSubtree(child);
    touch(parent);
    touchLayout(parent); // 结构变更 → 布局脏
}
/** 被摘下的子树要显式 free，否则 WASM 内存泄漏 */
function detachSubtree(node) {
    for (const c of node.children)
        detachSubtree(c);
    try {
        node.yoga.unsetMeasureFunc();
    }
    catch (e) {
        /* 未设置过 */
    }
    (0, yoga_1.freeYogaNode)(node.yoga);
}
/** 布局完成后把 Yoga 结果抄到节点上，并累加出视口绝对坐标 */
function collectLayout(node, ox = 0, oy = 0) {
    node.x = node.yoga.getComputedLeft();
    node.y = node.yoga.getComputedTop();
    node.w = node.yoga.getComputedWidth();
    node.h = node.yoga.getComputedHeight();
    node.ax = ox + node.x;
    node.ay = oy + node.y;
    // 滚动容器：子节点的绝对坐标要减去偏移，命中测试与绘制都直接吃 ax/ay，天然一致
    const cx = node.ax - node.scrollX;
    const cy = node.ay - node.scrollY;
    // 视口剔除安全标志：子树含 zIndex>0 浮层或 transform 时，其绘制盒可能逸出自身布局盒，
    // 不可按布局盒整块剔除；否则可安全剔除（painter 对裁剪带外的干净子树直接跳过）。
    const z = node.style.zIndex;
    let clean = !(typeof z === 'number' && z > 0);
    let noOverlay = clean;
    let hasVideo = node.kind === 'video';
    let hasImage = node.kind === 'image';
    if (clean) {
        const tf = node.style.transform;
        if (Array.isArray(tf) && tf.length > 0)
            clean = false;
    }
    for (const c of node.children) {
        collectLayout(c, cx, cy);
        if (!c.__cullClean)
            clean = false;
        if (!c.__noOverlay)
            noOverlay = false;
        if (c.__hasVideo)
            hasVideo = true;
        if (c.__hasImage)
            hasImage = true;
    }
    node.__cullClean = clean;
    node.__noOverlay = noOverlay;
    node.__hasVideo = hasVideo;
    node.__hasImage = hasImage;
}
/**
 * 滚动容器的直接子节点不参与主轴收缩。
 * RN 的 flexShrink 默认是 1，内容一旦超出容器就会被等比压扁；而 ScrollView 的
 * 语义是「按自然尺寸布局、超出部分靠滚动」，所以这里显式关掉收缩。
 * 每帧统一走一遍，避免在 attach / setProps 各处维持状态。
 */
function applyScrollSemantics(node) {
    if (node.kind === 'scroll') {
        for (const c of node.children) {
            if (c.__shrinkOff)
                continue; // 已施加过就不再重复 set：避免每帧把 Yoga 标脏
            c.yoga.setFlexShrink(0);
            c.__shrinkOff = true;
        }
        // 受控滚动：props.scrollY/scrollX 存在时每帧同步到偏移（BackTop/Anchor 回顶用）；
        // 不传则保持非受控，滚轮写入的偏移不受干扰
        if (typeof node.props.scrollY === 'number' && Math.abs(node.props.scrollY - node.scrollY) > 0.5) {
            node.scrollY = node.props.scrollY;
        }
        if (typeof node.props.scrollX === 'number' && Math.abs(node.props.scrollX - node.scrollX) > 0.5) {
            node.scrollX = node.props.scrollX;
        }
    }
    for (const c of node.children)
        applyScrollSemantics(c);
}
/** 滚动内容的总尺寸（用于算滚动上限） */
function scrollContentSize(node) {
    let w = 0;
    let h = 0;
    for (const c of node.children) {
        if (c.style.display === 'none')
            continue;
        w = Math.max(w, c.x + c.w);
        h = Math.max(h, c.y + c.h);
    }
    return { w, h };
}
/** 深度优先遍历（绘制顺序 = 文档顺序，后者覆盖前者） */
function walk(root, fn, depth = 0) {
    fn(root, depth);
    for (const c of root.children)
        walk(c, fn, depth + 1);
}
