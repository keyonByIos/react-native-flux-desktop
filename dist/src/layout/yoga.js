"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectionLTR = exports.MeasureMode = void 0;
exports.initYoga = initYoga;
exports.isYogaReady = isYogaReady;
exports.createYogaNode = createYogaNode;
exports.freeYogaNode = freeYogaNode;
exports.applyStyleToNode = applyStyleToNode;
exports.setMeasureFunc = setMeasureFunc;
exports.markDirty = markDirty;
exports.unsetMeasureFunc = unsetMeasureFunc;
exports.calculateLayout = calculateLayout;
// Yoga 桥接：把归一化后的 RN style 落到 Yoga 节点上。
// yoga-layout@2.x 的 package.json exports 只映射 ESM 入口，在 moduleResolution:"node" 下
// 无法解析其类型，故直接走 require 拿运行时对象（Node 24 / qode 均支持 CJS）。
const YogaModule = require('yoga-layout');
let Y = null;
/** 加载 WASM 版 Yoga；进程内只需一次 */
async function initYoga() {
    if (Y)
        return;
    Y = await YogaModule.loadYoga();
}
function isYogaReady() {
    return !!Y;
}
const E = YogaModule;
// RN 的 style 值是小写连字符串（'space-between'），Yoga 枚举键是 PascalCase（SpaceBetween）。
// 直接 E.FlexDirection[value] 查不到会静默 fallback 到默认值，表现为「row / 居中全部失效」，
// 所以必须走显式映射表。
const FLEX_DIRECTION = {
    row: E.FlexDirection.Row,
    'row-reverse': E.FlexDirection.RowReverse,
    column: E.FlexDirection.Column,
    'column-reverse': E.FlexDirection.ColumnReverse,
};
const ALIGN = {
    auto: E.Align.Auto,
    'flex-start': E.Align.FlexStart,
    center: E.Align.Center,
    'flex-end': E.Align.FlexEnd,
    stretch: E.Align.Stretch,
    baseline: E.Align.Baseline,
    'space-between': E.Align.SpaceBetween,
    'space-around': E.Align.SpaceAround,
};
const JUSTIFY = {
    'flex-start': E.Justify.FlexStart,
    center: E.Justify.Center,
    'flex-end': E.Justify.FlexEnd,
    'space-between': E.Justify.SpaceBetween,
    'space-around': E.Justify.SpaceAround,
    'space-evenly': E.Justify.SpaceEvenly,
};
const WRAP = {
    nowrap: E.Wrap.NoWrap,
    wrap: E.Wrap.Wrap,
    'wrap-reverse': E.Wrap.WrapReverse,
};
const OVERFLOW = {
    visible: E.Overflow.Visible,
    hidden: E.Overflow.Hidden,
    scroll: E.Overflow.Scroll,
};
function createYogaNode() {
    return Y.Node.create();
}
function freeYogaNode(node) {
    try {
        node.free();
    }
    catch (e) {
        /* 已随父节点释放 */
    }
}
/** 尺寸类属性：数字 / 百分比 / auto 三分支 */
function setDim(node, kind, value) {
    if (value === undefined || value === null)
        return;
    if (value === 'auto') {
        if (kind === 'Width' && node.setWidthAuto)
            node.setWidthAuto();
        else if (kind === 'Height' && node.setHeightAuto)
            node.setHeightAuto();
        else if (kind === 'FlexBasis' && node.setFlexBasisAuto)
            node.setFlexBasisAuto();
        return;
    }
    const s = String(value).trim();
    if (s.endsWith('%')) {
        const pct = parseFloat(s);
        if (kind === 'Width')
            node.setWidthPercent(pct);
        else if (kind === 'Height')
            node.setHeightPercent(pct);
        else
            node.setFlexBasisPercent(pct);
        return;
    }
    const n = parseFloat(s);
    if (!Number.isFinite(n))
        return;
    if (kind === 'Width')
        node.setWidth(n);
    else if (kind === 'Height')
        node.setHeight(n);
    else
        node.setFlexBasis(n);
}
function setEdge(node, setter, edgeName, value) {
    if (value === undefined || value === null)
        return;
    const edge = E.Edge[edgeName];
    const s = String(value).trim();
    if (s.endsWith('%')) {
        node[setter + 'Percent'] ? node[setter + 'Percent'](edge, parseFloat(s)) : node[setter](edge, parseFloat(s));
        return;
    }
    const n = parseFloat(s);
    if (Number.isFinite(n))
        node[setter](edge, n);
}
/**
 * 把 RN style 应用到 Yoga 节点。
 * 默认值与 RN 一致：flexDirection=column、alignItems=stretch、flexShrink=1。
 * （RN 的 flexShrink 默认是 1，和 Web 的 0 相反——不显式设会导致内容被压缩行为不一致。）
 */
function applyStyleToNode(node, s) {
    node.setFlexDirection(FLEX_DIRECTION[s.flexDirection ?? 'column'] ?? E.FlexDirection.Column);
    node.setAlignItems(ALIGN[s.alignItems ?? 'stretch'] ?? E.Align.Stretch);
    node.setAlignContent(ALIGN[s.alignContent ?? 'stretch'] ?? E.Align.Stretch);
    if (s.alignSelf)
        node.setAlignSelf(ALIGN[s.alignSelf] ?? E.Align.Auto);
    node.setJustifyContent(JUSTIFY[s.justifyContent ?? 'flex-start'] ?? E.Justify.FlexStart);
    node.setFlexWrap(WRAP[s.flexWrap ?? 'nowrap'] ?? E.Wrap.NoWrap);
    node.setOverflow(OVERFLOW[s.overflow ?? 'visible'] ?? E.Overflow.Visible);
    node.setDisplay(s.display === 'none' ? E.Display.None : E.Display.Flex);
    node.setPositionType(s.position === 'absolute' ? E.PositionType.Absolute : E.PositionType.Relative);
    if (s.flex !== undefined)
        node.setFlex(Number(s.flex) || 0);
    if (s.flexGrow !== undefined)
        node.setFlexGrow(Number(s.flexGrow) || 0);
    if (s.flexShrink !== undefined)
        node.setFlexShrink(Number(s.flexShrink));
    else
        node.setFlexShrink(1); // RN 默认
    setDim(node, 'FlexBasis', s.flexBasis);
    setDim(node, 'Width', s.width);
    setDim(node, 'Height', s.height);
    if (s.minWidth !== undefined)
        node.setMinWidth(parseFloat(s.minWidth) || 0);
    if (s.maxWidth !== undefined)
        node.setMaxWidth(parseFloat(s.maxWidth) || 0);
    if (s.minHeight !== undefined)
        node.setMinHeight(parseFloat(s.minHeight) || 0);
    if (s.maxHeight !== undefined)
        node.setMaxHeight(parseFloat(s.maxHeight) || 0);
    if (s.aspectRatio !== undefined)
        node.setAspectRatio(parseFloat(String(s.aspectRatio)));
    setEdge(node, 'setPosition', 'Top', s.top);
    setEdge(node, 'setPosition', 'Bottom', s.bottom);
    setEdge(node, 'setPosition', 'Left', s.left);
    setEdge(node, 'setPosition', 'Right', s.right);
    setEdge(node, 'setMargin', 'Top', s.marginTop);
    setEdge(node, 'setMargin', 'Right', s.marginRight);
    setEdge(node, 'setMargin', 'Bottom', s.marginBottom);
    setEdge(node, 'setMargin', 'Left', s.marginLeft);
    setEdge(node, 'setPadding', 'Top', s.paddingTop);
    setEdge(node, 'setPadding', 'Right', s.paddingRight);
    setEdge(node, 'setPadding', 'Bottom', s.paddingBottom);
    setEdge(node, 'setPadding', 'Left', s.paddingLeft);
    if (s.gap !== undefined && node.setGap) {
        node.setGap(E.Gutter.Row, s.gap);
        node.setGap(E.Gutter.Column, s.gap);
    }
    // 边框宽度参与布局（RN 语义：border 在盒内，会挤压内容）
    if (node.setBorder) {
        for (const [edge, key] of [
            ['Top', 'borderTopWidth'],
            ['Right', 'borderRightWidth'],
            ['Bottom', 'borderBottomWidth'],
            ['Left', 'borderLeftWidth'],
        ]) {
            const v = s[key] ?? s.borderWidth;
            if (v !== undefined)
                node.setBorder(E.Edge[edge], parseFloat(v) || 0);
        }
    }
}
/** 文本节点测量回调：由 Painter 提供字体度量，Yoga 在布局时回调 */
function setMeasureFunc(node, fn) {
    node.setMeasureFunc(fn);
}
/**
 * 标脏：强制 Yoga 下次 calculateLayout 重新调用 measureFunc。
 * 文本内容变化后必须标脏，否则 Yoga 沿用缓存的旧测量宽度，
 * 变长的末尾字符会被 overflow:hidden 裁掉（表现为「打字落后一帧」）。
 */
function markDirty(node) {
    try {
        node.markDirty();
    }
    catch (e) {
        /* 无 measureFunc 的节点标脏会抛错，忽略 */
    }
}
function unsetMeasureFunc(node) {
    try {
        node.unsetMeasureFunc();
    }
    catch (e) {
        /* 未设置过 */
    }
}
/** MeasureMode 枚举值（回调里判断父级给的约束类型） */
exports.MeasureMode = {
    Undefined: E.MeasureMode.Undefined,
    Exactly: E.MeasureMode.Exactly,
    AtMost: E.MeasureMode.AtMost,
};
exports.DirectionLTR = E.Direction.LTR;
/** 计算整棵树布局 */
function calculateLayout(root, width, height) {
    root.calculateLayout(width, height, E.Direction.LTR);
}
