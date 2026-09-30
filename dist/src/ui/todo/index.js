"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Todo = void 0;
// Todo：待办清单。数据驱动 items（id / title / description / done / extra / node）。
// 「支持自定义节点」两条逃生口：
//   1) item.node —— 替换默认「标题 + 描述」内容区，勾选框 / extra / 删除外壳保留（轻量定制）。
//   2) renderItem(item, index, ctx) —— 接管整行渲染，ctx 提供 done / toggle / remove（完全定制）。
// 完成态受控（checked）/ 非受控（defaultChecked）双模式；showCount 汇总、allowDelete 删除、size 三档。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
function isPlain(c) {
    return typeof c === 'string' || typeof c === 'number';
}
function TodoBase(props) {
    const { token } = (0, theme_1.useToken)();
    const { items = [], checked, defaultChecked, onChange, onDelete, renderItem, header, footer, showCount = false, allowDelete = false, size = 'default', disabled, style, } = props;
    const controlled = checked !== undefined;
    const seed = react_1.default.useRef(defaultChecked ?? items.filter((it) => it.done).map((it) => it.id));
    const [inner, setInner] = react_1.default.useState(seed.current);
    const doneSet = new Set(controlled ? checked : inner);
    const toggle = (id) => {
        const cur = controlled ? checked : inner;
        const next = cur.indexOf(id) >= 0 ? cur.filter((x) => x !== id) : cur.concat(id);
        if (!controlled)
            setInner(next);
        onChange && onChange(next);
    };
    const remove = (item) => {
        onDelete && onDelete(item);
    };
    const boxSize = size === 'small' ? token.controlHeightSM * 0.42 : size === 'large' ? 22 : 18;
    const vPad = size === 'small' ? token.paddingXXS : size === 'large' ? token.padding : token.paddingXS;
    const hPad = token.paddingSM;
    const doneCount = items.filter((it) => doneSet.has(it.id)).length;
    return (react_1.default.createElement(components_1.View, { style: [
            {
                backgroundColor: token.colorBgContainer,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: token.colorBorderSecondary,
                borderRadius: token.borderRadiusLG,
                overflow: 'hidden',
            },
            style,
        ] },
        header != null ? (react_1.default.createElement(components_1.View, { style: {
                paddingHorizontal: hPad,
                paddingVertical: token.paddingXS,
                borderBottomWidth: token.lineWidth,
                borderBottomColor: token.colorBorderSecondary,
            } }, isPlain(header) ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, fontWeight: '500', color: token.colorText } }, String(header))) : (header))) : null,
        items.map((item, i) => {
            const done = doneSet.has(item.id);
            const rowDisabled = !!disabled || !!item.disabled;
            const ctx = { done, toggle: () => toggle(item.id), remove: () => remove(item) };
            const split = i < items.length - 1 ? token.lineWidth : 0;
            // 整行自定义：renderItem 全权接管（外壳边框 / 分隔线仍由 Todo 负责）
            if (renderItem) {
                return (react_1.default.createElement(components_1.View, { key: String(item.id), style: { borderBottomWidth: split, borderBottomColor: token.colorSplit } }, renderItem(item, i, ctx)));
            }
            // 默认行：勾选框 + 内容区（item.node 可替换标题/描述）+ extra + 删除
            return (react_1.default.createElement(components_1.Pressable, { key: String(item.id), disabled: rowDisabled, onPress: () => toggle(item.id), style: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: vPad,
                    paddingHorizontal: hPad,
                    borderBottomWidth: split,
                    borderBottomColor: token.colorSplit,
                    cursor: rowDisabled ? 'default' : 'pointer',
                    opacity: rowDisabled ? 0.5 : 1,
                } },
                react_1.default.createElement(components_1.View, { style: {
                        width: boxSize,
                        height: boxSize,
                        borderRadius: token.borderRadiusSM,
                        borderWidth: token.lineWidth,
                        borderStyle: 'solid',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        backgroundColor: done ? token.colorPrimary : token.colorBgContainer,
                        borderColor: done ? token.colorPrimary : token.colorBorder,
                    } }, done ? react_1.default.createElement(icon_1.Icon, { name: "check", size: boxSize * 0.78, color: token.colorTextLightSolid, strokeWidth: 3 }) : null),
                react_1.default.createElement(components_1.View, { style: { flex: 1, marginLeft: token.marginSM } }, item.node != null ? (item.node) : (react_1.default.createElement(react_1.default.Fragment, null,
                    item.title != null ? (isPlain(item.title) ? (react_1.default.createElement(components_1.Text, { style: {
                            fontSize: token.fontSize,
                            color: done ? token.colorTextTertiary : token.colorText,
                            textDecorationLine: done ? 'line-through' : 'none',
                        } }, String(item.title))) : (item.title)) : null,
                    item.description != null ? (isPlain(item.description) ? (react_1.default.createElement(components_1.Text, { style: {
                            fontSize: token.fontSizeSM,
                            color: done ? token.colorTextQuaternary : token.colorTextSecondary,
                            marginTop: 2,
                        } }, String(item.description))) : (item.description)) : null))),
                item.extra != null ? react_1.default.createElement(components_1.View, { style: { flexShrink: 0, marginLeft: token.marginSM } }, item.extra) : null,
                allowDelete ? (react_1.default.createElement(components_1.Pressable, { onPress: () => remove(item), style: { flexShrink: 0, marginLeft: token.marginXS, padding: token.paddingXXS, cursor: rowDisabled ? 'default' : 'pointer' } },
                    react_1.default.createElement(icon_1.Icon, { name: "delete", size: token.fontSize, color: token.colorTextTertiary }))) : null));
        }),
        items.length === 0 ? (react_1.default.createElement(components_1.View, { style: { padding: token.paddingLG, alignItems: 'center' } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextTertiary } }, "\u6682\u65E0\u5F85\u529E"))) : null,
        showCount ? (react_1.default.createElement(components_1.View, { style: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: hPad,
                paddingVertical: token.paddingXS,
                borderTopWidth: token.lineWidth,
                borderTopColor: token.colorBorderSecondary,
                backgroundColor: token.colorFillQuaternary,
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } },
                "\u5DF2\u5B8C\u6210 ",
                doneCount,
                " / ",
                items.length),
            items.length > 0 ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: doneCount === items.length ? token.colorSuccess : token.colorTextTertiary } }, doneCount === items.length ? '全部完成' : `剩余 ${items.length - doneCount} 项`)) : null)) : null,
        footer != null ? (react_1.default.createElement(components_1.View, { style: { paddingHorizontal: hPad, paddingVertical: token.paddingXS, borderTopWidth: token.lineWidth, borderTopColor: token.colorBorderSecondary } }, footer)) : null));
}
exports.Todo = TodoBase;
exports.default = exports.Todo;
