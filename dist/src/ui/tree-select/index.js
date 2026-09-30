"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeSelect = TreeSelect;
// TREESELECT：触发器 + 下拉树面板（复用 Tree）。面板绝对定位覆盖（同 Select），不依赖浮层 z 栈。
// 对齐 antd v5：size / status / placement / multiple（checkable 树 + 标签）/ allowClear。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const tree_1 = require("../tree");
const FadeIn_1 = require("../../anim/FadeIn");
const useOverlayGate_1 = require("../../events/useOverlayGate");
function findTitle(nodes, key) {
    for (const n of nodes) {
        if (n.key === key)
            return n.title;
        if (n.children) {
            const t = findTitle(n.children, key);
            if (t !== undefined)
                return t;
        }
    }
    return undefined;
}
function TreeSelect(props) {
    const { token } = (0, theme_1.useToken)();
    const { treeData, value, defaultValue, placeholder = '请选择', disabled, allowClear, multiple, size = 'middle', status, placement = 'bottomLeft', open, onChange, style, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue);
    const selected = value !== undefined ? value : inner;
    const [expanded, setExpanded] = react_1.default.useState(false);
    const showPanel = open !== undefined ? open : expanded;
    // 点击空白处关闭 + 同屏互斥（受控常驻展开 open / disabled 不参与）
    const { onTriggerAbs, onPanelAbs } = (0, useOverlayGate_1.useOverlayGate)(showPanel && open === undefined && !disabled, () => setExpanded(false));
    const selectedArr = selected == null ? [] : Array.isArray(selected) ? selected : [selected];
    const hasValue = selectedArr.length > 0;
    const commit = (v) => {
        if (value === undefined)
            setInner(v);
        onChange && onChange(v);
    };
    const handleSelect = (keys) => {
        const k = keys[keys.length - 1];
        commit(k);
        if (open === undefined)
            setExpanded(false);
    };
    const handleCheck = (keys) => {
        commit(keys);
    };
    const clear = () => commit(multiple ? [] : undefined);
    const h = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const borderColor = status === 'error' ? token.colorError : status === 'warning' ? token.colorWarning : showPanel ? token.colorPrimary : token.colorBorder;
    const up = placement === 'topLeft' || placement === 'topRight';
    const alignRight = placement === 'bottomRight' || placement === 'topRight';
    const singleTitle = !multiple && hasValue ? findTitle(treeData, selectedArr[0]) : undefined;
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayoutAbs: onTriggerAbs },
        react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: () => (open === undefined ? setExpanded((v) => !v) : undefined), style: {
                minHeight: h,
                paddingHorizontal: token.paddingSM,
                paddingVertical: multiple ? token.paddingXXS : 0,
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: token.marginXXS,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgContainer,
                opacity: disabled ? 0.65 : 1,
            } },
            hasValue ? (multiple ? (selectedArr.map((v) => (react_1.default.createElement(components_1.View, { key: v, style: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: token.paddingXXS,
                    height: token.controlHeightSM - token.marginXXS,
                    borderRadius: token.borderRadiusSM,
                    backgroundColor: token.colorFillSecondary,
                } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorText } }, findTitle(treeData, v)))))) : (react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: token.fontSize, color: token.colorText }, numberOfLines: 1 }, singleTitle))) : (react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: token.fontSize, color: token.colorTextQuaternary } }, placeholder)),
            allowClear && hasValue && !disabled ? (react_1.default.createElement(components_1.Pressable, { onPress: clear, style: { paddingHorizontal: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "closeCircle", size: token.fontSize, color: token.colorTextQuaternary }))) : (react_1.default.createElement(icon_1.Icon, { name: "down", size: token.fontSizeSM, color: token.colorTextQuaternary, rotate: showPanel ? 180 : 0 }))),
        showPanel ? (react_1.default.createElement(components_1.View, { onLayoutAbs: onPanelAbs, style: {
                position: 'absolute',
                zIndex: 1050,
                left: alignRight ? undefined : 0,
                right: alignRight ? 0 : undefined,
                top: up ? undefined : h + token.marginXXS,
                bottom: up ? h + token.marginXXS : undefined,
                width: '100%',
                maxHeight: token.controlHeightLG * 6,
                padding: token.paddingXS,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: token.colorBorderSecondary,
                borderRadius: token.borderRadiusLG,
                backgroundColor: token.colorBgElevated,
            } },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160 },
                react_1.default.createElement(components_1.ScrollView, { style: { maxHeight: token.controlHeightLG * 6 - token.padding } },
                    react_1.default.createElement(tree_1.Tree, { treeData: treeData, checkable: multiple, defaultExpandedKeys: treeData.map((n) => n.key), selectedKeys: multiple ? [] : selectedArr, checkedKeys: multiple ? selectedArr : [], onSelect: multiple ? undefined : handleSelect, onCheck: multiple ? handleCheck : undefined }))))) : null));
}
exports.default = TreeSelect;
