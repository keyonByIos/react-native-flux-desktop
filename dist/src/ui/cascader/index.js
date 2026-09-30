"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cascader = Cascader;
// CASCADER：级联选择。触发器 + 多列面板（每列一屏选项，点/悬父项展开下一列，点叶子提交）。
// 下拉用绝对定位面板（文档顺序覆盖，同 Select），FadeIn 淡入。对齐 antd v5：size / placement / expandTrigger / changeOnSelect / displayRender / showArrow / status。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
const useOverlayGate_1 = require("../../events/useOverlayGate");
/** 沿路径逐级解析出节点数组 */
function resolvePath(options, path) {
    const out = [];
    let level = options;
    for (const v of path) {
        const node = level.find((o) => o.value === v);
        if (!node)
            break;
        out.push(node);
        level = node.children ?? [];
    }
    return out;
}
function Cascader(props) {
    const { token } = (0, theme_1.useToken)();
    const { options, value, defaultValue, placeholder = '请选择', disabled, allowClear, size = 'middle', placement = 'bottomLeft', expandTrigger = 'click', changeOnSelect, displayRender, showArrow = true, status, open, onChange, style, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue ?? []);
    const selected = value !== undefined ? value : inner;
    const [activePath, setActivePath] = react_1.default.useState(selected);
    const [expanded, setExpanded] = react_1.default.useState(false);
    const showPanel = open !== undefined ? open : expanded;
    // 点击空白处关闭 + 同屏互斥（受控常驻展开 open / disabled 不参与）
    const { onTriggerAbs, onPanelAbs } = (0, useOverlayGate_1.useOverlayGate)(showPanel && open === undefined && !disabled, () => setExpanded(false));
    const controlH = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const commit = (path) => {
        if (value === undefined)
            setInner(path);
        onChange && onChange(path, resolvePath(options, path));
    };
    const pick = (node, depth) => {
        if (disabled || node.disabled)
            return;
        const nextPath = activePath.slice(0, depth).concat(node.value);
        setActivePath(nextPath);
        const isLeaf = !node.children || node.children.length === 0;
        if (isLeaf || changeOnSelect) {
            commit(nextPath);
            if (isLeaf && open === undefined)
                setExpanded(false);
        }
    };
    // 悬停展开：hover 到有子节点的行时展开该分支（不提交）
    const hoverExpand = (node, depth) => {
        if (expandTrigger !== 'hover' || disabled || node.disabled)
            return;
        if (node.children && node.children.length) {
            setActivePath(activePath.slice(0, depth).concat(node.value));
        }
    };
    const clear = () => {
        commit([]);
        setActivePath([]);
    };
    // 依据 activePath 计算要展示的列
    const columns = [];
    let level = options;
    if (level.length) {
        columns.push(level);
        for (let d = 0; d < activePath.length; d++) {
            const node = level.find((o) => o.value === activePath[d]);
            if (node && node.children && node.children.length) {
                columns.push(node.children);
                level = node.children;
            }
            else
                break;
        }
    }
    const chosen = resolvePath(options, selected);
    const hasValue = chosen.length > 0;
    const colWidth = token.controlHeightLG * 3;
    const panelH = token.controlHeightLG * 5;
    const borderColor = showPanel ? token.colorPrimary
        : status === 'error' ? token.colorError
            : status === 'warning' ? token.colorWarning
                : token.colorBorder;
    const below = placement === 'bottomLeft' || placement === 'bottomRight';
    const alignRight = placement === 'bottomRight' || placement === 'topRight';
    const panelStyle = {
        position: 'absolute',
        zIndex: 1050,
        [alignRight ? 'right' : 'left']: 0,
        [below ? 'top' : 'bottom']: controlH + token.marginXXS,
        flexDirection: 'row',
        height: panelH,
        borderWidth: token.lineWidth,
        borderStyle: 'solid',
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
        backgroundColor: token.colorBgElevated,
        overflow: 'hidden',
    };
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayoutAbs: onTriggerAbs },
        react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: () => (open === undefined ? setExpanded((v) => !v) : undefined), style: {
                minHeight: controlH,
                paddingHorizontal: token.paddingSM,
                paddingVertical: token.paddingXXS,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgContainer,
                opacity: disabled ? 0.65 : 1,
            } },
            hasValue ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText, flex: 1 }, numberOfLines: 1 }, displayRender
                ? displayRender(chosen.map((n) => n.label), chosen)
                : chosen.map((n) => n.label).join(' / '))) : (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextQuaternary, flex: 1 } }, placeholder)),
            allowClear && hasValue && !disabled ? (react_1.default.createElement(components_1.Pressable, { onPress: clear, style: { paddingHorizontal: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "closeCircle", size: token.fontSize, color: token.colorTextQuaternary }))) : showArrow ? (react_1.default.createElement(icon_1.Icon, { name: "down", size: token.fontSizeSM, color: token.colorTextQuaternary, rotate: showPanel ? 180 : 0 })) : null),
        showPanel && columns.length ? (react_1.default.createElement(components_1.View, { onLayoutAbs: onPanelAbs, style: panelStyle },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160, style: { flexDirection: 'row' } }, columns.map((col, depth) => (react_1.default.createElement(components_1.ScrollView, { key: depth, style: {
                    width: colWidth,
                    height: panelH,
                    borderRightWidth: depth < columns.length - 1 ? token.lineWidth : 0,
                    borderRightColor: token.colorSplit,
                } },
                react_1.default.createElement(components_1.View, { style: { paddingVertical: token.paddingXXS } }, col.map((node) => {
                    const on = activePath[depth] === node.value;
                    const hasChildren = !!node.children && node.children.length > 0;
                    return (react_1.default.createElement(components_1.Pressable, { key: node.value, disabled: node.disabled, onPress: () => pick(node, depth), onMouseEnter: () => hoverExpand(node, depth), style: {
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: token.paddingSM,
                            paddingVertical: token.paddingXS,
                            backgroundColor: on && !hasChildren ? token.colorFillTertiary : 'transparent',
                            opacity: node.disabled ? 0.45 : 1,
                        } },
                        react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: token.fontSize, color: on ? token.colorPrimary : token.colorText, fontWeight: on ? '500' : '400' }, numberOfLines: 1 }, node.label),
                        hasChildren ? react_1.default.createElement(icon_1.Icon, { name: "right", size: token.fontSizeSM, color: token.colorTextQuaternary }) : null));
                })))))))) : null));
}
exports.default = Cascader;
