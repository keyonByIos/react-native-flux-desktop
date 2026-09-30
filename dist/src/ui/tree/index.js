"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = Tree;
// Tree：树形控件。递归渲染，节点可展开/收起；checkable 时带复选框。
// 展开箭头走 Icon + rotate；选中/悬停高亮与 Menu 一致（禁用项 host 自动跳过 hover）。
// 对齐 antd v5：checkStrict（默认 false=父子联动，含半选 indeterminate）、defaultExpandAll、multiple、树级 disabled/selectable。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useTween_1 = require("../../anim/useTween");
function collectParentKeys(nodes) {
    const out = [];
    const walk = (list) => {
        for (const n of list) {
            if (n.children && n.children.length) {
                out.push(n.key);
                walk(n.children);
            }
        }
    };
    walk(nodes);
    return out;
}
function buildMaps(nodes) {
    const nodeMap = {};
    const parentMap = {};
    const walk = (list, parent) => {
        for (const n of list) {
            nodeMap[n.key] = n;
            parentMap[n.key] = parent;
            if (n.children)
                walk(n.children, n.key);
        }
    };
    walk(nodes);
    return { nodeMap, parentMap };
}
function NodeRow(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const { node, depth, expanded, selected, checked, indeterminate, checkable, treeDisabled, treeSelectable, indent } = props;
    const box = getComponentToken('Checkbox').controlInteractiveSize;
    const [hover, setHover] = react_1.default.useState(false);
    const hasChildren = !!node.children && node.children.length > 0;
    const isOpen = expanded.includes(node.key);
    const isSelected = selected.includes(node.key);
    const isChecked = checked.includes(node.key);
    const isIndeterminate = indeterminate.includes(node.key);
    const disabled = treeDisabled || !!node.disabled;
    const selectable = treeSelectable && node.selectable !== false && !disabled;
    // 展开箭头旋转缓动
    const chevronDeg = (0, useTween_1.useTween)(isOpen ? 90 : 0, 200);
    const fg = disabled ? token.colorTextQuaternary : isSelected ? token.colorPrimary : token.colorText;
    const boxOn = isChecked || isIndeterminate;
    return (react_1.default.createElement(components_1.View, null,
        react_1.default.createElement(components_1.Pressable, { disabled: disabled, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), onPress: () => selectable && props.onSelect(node.key), style: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: token.paddingXXS + 2,
                paddingLeft: depth * indent,
                paddingRight: token.paddingXS,
                borderRadius: token.borderRadius,
                backgroundColor: hover && !disabled ? token.colorFillQuaternary : 'transparent',
            } },
            react_1.default.createElement(components_1.Pressable, { onPress: () => hasChildren && props.onToggleExpand(node.key), style: { width: indent, height: box, alignItems: 'center', justifyContent: 'center' } }, hasChildren ? (react_1.default.createElement(icon_1.Icon, { name: "right", size: token.fontSizeSM, color: token.colorTextTertiary, strokeWidth: 2.5, rotate: chevronDeg })) : null),
            checkable ? (react_1.default.createElement(components_1.Pressable, { disabled: disabled || !!node.disableCheckbox, onPress: () => props.onCheck(node.key), style: { marginRight: token.marginXS } },
                react_1.default.createElement(components_1.View, { style: {
                        width: box,
                        height: box,
                        borderRadius: token.borderRadiusSM,
                        borderWidth: token.lineWidth,
                        borderColor: boxOn ? token.colorPrimary : token.colorBorder,
                        backgroundColor: isChecked ? token.colorPrimary : token.colorBgContainer,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: disabled ? 0.5 : 1,
                    } }, isChecked ? (react_1.default.createElement(icon_1.Icon, { name: "check", size: box - 4, color: token.colorTextLightSolid, strokeWidth: 3 })) : isIndeterminate ? (react_1.default.createElement(components_1.View, { style: { width: box * 0.5, height: token.lineWidth * 2.5, borderRadius: token.lineWidth, backgroundColor: token.colorPrimary } })) : null))) : null,
            node.icon != null ? (react_1.default.createElement(components_1.View, { style: { marginRight: token.marginXS } }, typeof node.icon === 'string' ? react_1.default.createElement(icon_1.Icon, { name: node.icon, size: token.fontSize, color: fg }) : node.icon)) : null,
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: fg } }, node.title)),
        hasChildren && isOpen
            ? node.children.map((c) => (react_1.default.createElement(NodeRow, { key: c.key, ...props, node: c, depth: depth + 1 })))
            : null));
}
function Tree(props) {
    const { token } = (0, theme_1.useToken)();
    const { treeData, expandedKeys, defaultExpandedKeys, defaultExpandAll, selectedKeys, defaultSelectedKeys, checkedKeys, defaultCheckedKeys, checkable, checkStrict, multiple, disabled: treeDisabled, selectable: treeSelectable = true, onExpand, onSelect, onCheck, indent, style, } = props;
    const ind = indent ?? token.controlHeightSM;
    const [exp, setExp] = react_1.default.useState(defaultExpandedKeys ?? (defaultExpandAll ? collectParentKeys(treeData) : []));
    const [sel, setSel] = react_1.default.useState(defaultSelectedKeys ?? []);
    const [chk, setChk] = react_1.default.useState(defaultCheckedKeys ?? []);
    const expanded = expandedKeys ?? exp;
    const selected = selectedKeys ?? sel;
    const checked = checkedKeys ?? chk;
    const { nodeMap, parentMap } = react_1.default.useMemo(() => buildMaps(treeData), [treeData]);
    function toggleExpand(k) {
        const next = expanded.includes(k) ? expanded.filter((x) => x !== k) : [...expanded, k];
        if (expandedKeys === undefined)
            setExp(next);
        onExpand && onExpand(next);
    }
    function select(k) {
        const isSelected = selected.includes(k);
        let next;
        if (multiple)
            next = isSelected ? selected.filter((x) => x !== k) : [...selected, k];
        else
            next = isSelected ? [] : [k];
        if (selectedKeys === undefined)
            setSel(next);
        onSelect && onSelect(next);
    }
    // 父子联动：勾选节点级联子孙，回溯重算祖先；半选在渲染期派生
    function linkedCheck(k) {
        const set = new Set(checked);
        const target = nodeMap[k];
        const willCheck = !set.has(k);
        const applyDown = (node) => {
            if (willCheck)
                set.add(node.key);
            else
                set.delete(node.key);
            node.children?.forEach(applyDown);
        };
        if (target)
            applyDown(target);
        let p = parentMap[k];
        while (p) {
            const pNode = nodeMap[p];
            const all = !!pNode.children && pNode.children.every((c) => set.has(c.key));
            if (all)
                set.add(p);
            else
                set.delete(p);
            p = parentMap[p];
        }
        return Array.from(set);
    }
    function check(k) {
        const next = checkStrict ? (checked.includes(k) ? checked.filter((x) => x !== k) : [...checked, k]) : linkedCheck(k);
        if (checkedKeys === undefined)
            setChk(next);
        onCheck && onCheck(next);
    }
    // 半选集合：自身未勾选，但存在被勾选的子孙
    const indeterminate = react_1.default.useMemo(() => {
        if (!checkable || checkStrict)
            return [];
        const checkedSet = new Set(checked);
        const out = [];
        const hasCheckedDesc = (node) => {
            let any = false;
            const walk = (n) => {
                n.children?.forEach((c) => {
                    if (checkedSet.has(c.key))
                        any = true;
                    walk(c);
                });
            };
            walk(node);
            return any;
        };
        for (const key of Object.keys(nodeMap)) {
            if (!checkedSet.has(key) && hasCheckedDesc(nodeMap[key]))
                out.push(key);
        }
        return out;
    }, [checkable, checkStrict, checked, nodeMap]);
    return (react_1.default.createElement(components_1.View, { style: style }, treeData.map((n) => (react_1.default.createElement(NodeRow, { key: n.key, node: n, depth: 0, expanded: expanded, selected: selected, checked: checked, indeterminate: indeterminate, checkable: !!checkable, treeDisabled: !!treeDisabled, treeSelectable: treeSelectable, indent: ind, onToggleExpand: toggleExpand, onSelect: select, onCheck: check })))));
}
exports.default = Tree;
