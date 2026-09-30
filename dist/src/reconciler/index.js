"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hosts = exports.appContainer = void 0;
exports.getActiveHost = getActiveHost;
exports.textStyleFor = textStyleFor;
// react-reconciler 宿主配置：React 组件树 → 纯 JS 场景树（不再映射到任何 Qt 控件）。
const react_reconciler_1 = __importDefault(require("react-reconciler"));
const constants_1 = require("react-reconciler/constants");
const node_1 = require("../scene/node");
const host_1 = require("../window/host");
const scheduler_1 = require("../frame/scheduler");
const yoga_1 = require("../layout/yoga");
const textLayout_1 = require("../paint/textLayout");
exports.appContainer = new Set();
const hosts = new WeakMap();
exports.hosts = hosts;
// 活跃 host 列表（WeakMap 不可枚举）：供快照/导出等运行时能力从组件层拿到当前窗口宿主
const activeHosts = [];
function getActiveHost() {
    return activeHosts.length ? activeHosts[activeHosts.length - 1] : null;
}
function trackHost(root) {
    if (!hosts.has(root)) {
        const host = new host_1.WindowHost(root);
        hosts.set(root, host);
        activeHosts.push(host);
    }
}
function untrackHost(root) {
    const host = hosts.get(root);
    if (host) {
        host.close();
        hosts.delete(root);
        const i = activeHosts.indexOf(host);
        if (i >= 0)
            activeHosts.splice(i, 1);
    }
}
/** 标签名 → 场景节点类型 */
const KIND_BY_TAG = {
    window: 'window',
    view: 'view',
    scrollview: 'scroll',
    pressable: 'view',
    text: 'text',
    image: 'image',
    video: 'video',
    icon: 'icon',
};
const kindOf = (type) => KIND_BY_TAG[String(type).toLowerCase()] ?? 'view';
/**
 * 把 <Text> 的原始 children 合成一段内联文本。
 * RN 里 Text 的字符串 / 数字子节点（含 {expr} 插值）是内联的，不是块；
 * 不合成的话 `Primary {n}` 会被拆成两个竖排的盒子。
 * 只要出现元素子节点就返回 null，交回正常的块级子节点路径。
 */
function inlineTextOf(children) {
    if (typeof children === 'string')
        return children;
    if (typeof children === 'number')
        return String(children);
    if (Array.isArray(children)) {
        let out = '';
        for (const c of children) {
            if (c === null || c === false || c === true || c === undefined)
                continue;
            const s = inlineTextOf(c);
            if (s === null)
                return null;
            out += s;
        }
        return out;
    }
    return null;
}
/**
 * 裸文本节点（<Text>里的字符串）自己没有 fontSize/color，
 * 必须沿父链继承，否则测量与绘制都会退化成默认 14px 黑字。
 */
function textStyleFor(node) {
    if (node.style.fontSize !== undefined || !node.parent)
        return node.style;
    return { ...textStyleFor(node.parent), ...node.style };
}
/** 给文本节点挂 Yoga measure 回调；Yoga 布局时同步回调 JS 拿内容尺寸 */
function attachMeasure(node) {
    if (node.kind !== 'text' || node.children.length > 0)
        return;
    try {
        node.yoga.unsetMeasureFunc();
    }
    catch (e) {
        /* 尚未设置 */
    }
    node.yoga.setMeasureFunc((width, widthMode) => {
        const style = textStyleFor(node);
        const maxLines = node.props.numberOfLines ?? (node.parent ? node.parent.props.numberOfLines : undefined);
        const r = (0, textLayout_1.measureTextBlock)(node.text, style, width, widthMode, maxLines, !!node.props.preserveTrailingSpace);
        if (process.env.FLUX_DEBUG) {
            console.log(`>>> measure "${(node.text || '').slice(0, 10)}" in(${width},${widthMode}) fs=${style.fontSize} lh=${style.lineHeight} -> ${r.width}x${r.height}`);
        }
        return r;
    });
    // 内容可能已变（文本更新走这里），标脏强制下帧重测，避免沿用旧宽度裁掉末尾字符
    (0, yoga_1.markDirty)(node.yoga);
}
const HostConfig = {
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    isPrimaryRenderer: true,
    noTimeout: -1,
    now: Date.now,
    getRootHostContext: () => ({}),
    getChildHostContext: () => ({}),
    prepareForCommit: () => null,
    // 每次 commit 结束后请求一帧：布局 + 绘制 + 贴图
    resetAfterCommit: () => (0, scheduler_1.scheduleFrame)(),
    getInstanceFromNode: () => null,
    beforeActiveInstanceBlur: () => { },
    afterActiveInstanceBlur: () => { },
    preparePortalMount: () => { },
    scheduleMicrotask: typeof queueMicrotask === 'function' ? queueMicrotask : (cb) => Promise.resolve().then(cb),
    getCurrentEventPriority: () => constants_1.DefaultEventPriority,
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    // Text 的纯字符串子节点直接写进 node.text，不额外生成子实例
    shouldSetTextContent: (type, props) => {
        if (kindOf(type) !== 'text')
            return false;
        return inlineTextOf(props.children) !== null;
    },
    createTextInstance: (text) => {
        const node = (0, node_1.createSceneNode)('text', {});
        node.text = String(text);
        attachMeasure(node);
        return node;
    },
    createInstance: (type, props) => {
        const kind = kindOf(type);
        const node = (0, node_1.createSceneNode)(kind, props);
        if (kind === 'text') {
            const t = inlineTextOf(props.children);
            if (t !== null)
                node.text = t;
        }
        return node;
    },
    appendInitialChild: (parent, child) => (0, node_1.appendChild)(parent, child),
    finalizeInitialChildren: (instance, type) => {
        if (kindOf(type) === 'text')
            attachMeasure(instance);
        return false;
    },
    commitMount: () => { },
    appendChildToContainer: (container, child) => {
        container.add(child);
        trackHost(child);
    },
    insertInContainerBefore: (container, child) => {
        container.add(child);
        trackHost(child);
    },
    removeChildFromContainer: (container, child) => {
        container.delete(child);
        untrackHost(child);
    },
    clearContainer: (container) => {
        for (const child of container)
            untrackHost(child);
        container.clear();
    },
    prepareUpdate: () => true,
    commitUpdate: (instance, _payload, _type, _oldProps, newProps) => {
        (0, node_1.setProps)(instance, newProps);
        if (instance.kind === 'text') {
            const t = inlineTextOf(newProps.children);
            // 文本内容不在 setProps 的 epoch 判定内（children 被排除），此处变了才补 touch 并重测
            if (t !== null && t !== instance.text) {
                instance.text = t;
                (0, node_1.touch)(instance);
            }
            attachMeasure(instance);
        }
    },
    appendChild: (parent, child) => {
        (0, node_1.appendChild)(parent, child);
        if (parent.kind === 'text')
            attachMeasure(parent);
    },
    insertBefore: (parent, child, before) => (0, node_1.insertBefore)(parent, child, before),
    removeChild: (parent, child) => (0, node_1.removeChild)(parent, child),
    commitTextUpdate: (node, _old, newText) => {
        (0, node_1.setText)(node, newText);
        attachMeasure(node);
        (0, scheduler_1.scheduleFrame)();
    },
    resetTextContent: () => { },
    hideInstance: (node) => {
        node.visible = false;
    },
    unhideInstance: (node) => {
        node.visible = true;
    },
    hideTextInstance: (node) => {
        node.visible = false;
    },
    unhideTextInstance: (node) => {
        node.visible = true;
    },
    getPublicInstance: (instance) => instance,
    detachDeletedInstance: () => { },
};
const reconciler = (0, react_reconciler_1.default)(HostConfig);
exports.default = reconciler;
