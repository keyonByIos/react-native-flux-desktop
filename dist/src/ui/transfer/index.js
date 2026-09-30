"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = Transfer;
// TRANSFER：双栏穿梭选择。左源右目标，勾选后整体搬运；受控 targetKeys + 非受控兜底。
// 对齐 antd v5：titles / operations / showSelectAll / oneWay / 单项 disabled / listStyle。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const checkbox_1 = require("../checkbox");
const icon_1 = require("../icon");
function Transfer(props) {
    const { token } = (0, theme_1.useToken)();
    const { dataSource, targetKeys, defaultTargetKeys = [], titles, operations, showSelectAll = true, oneWay, disabled, listStyle, onChange } = props;
    const [inner, setInner] = react_1.default.useState(defaultTargetKeys);
    const tKeys = targetKeys !== undefined ? targetKeys : inner;
    const [checked, setChecked] = react_1.default.useState({});
    const left = dataSource.filter((d) => !tKeys.includes(d.key));
    const right = dataSource.filter((d) => tKeys.includes(d.key));
    const commit = (next) => {
        if (targetKeys === undefined)
            setInner(next);
        onChange && onChange(next);
    };
    const move = (toRight) => {
        if (disabled)
            return;
        const ids = dataSource.filter((d) => checked[d.key] && !d.disabled).map((d) => d.key);
        if (!ids.length)
            return;
        const set = new Set(tKeys);
        ids.forEach((k) => (toRight ? set.add(k) : set.delete(k)));
        commit(Array.from(set));
        setChecked({});
    };
    // 单向：直接切换某一项是否入右
    const toggleOne = (key, on) => {
        if (disabled)
            return;
        const set = new Set(tKeys);
        if (on)
            set.add(key);
        else
            set.delete(key);
        commit(Array.from(set));
    };
    const header = (items, title) => {
        const enabled = items.filter((i) => !i.disabled);
        const allOn = enabled.length > 0 && enabled.every((i) => checked[i.key]);
        const someOn = enabled.some((i) => checked[i.key]);
        return (react_1.default.createElement(components_1.View, { style: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: token.paddingSM,
                height: token.controlHeightSM + token.paddingXS,
                borderBottomWidth: token.lineWidth,
                borderBottomColor: token.colorBorderSecondary,
                backgroundColor: token.colorFillQuaternary,
            } },
            showSelectAll && !oneWay ? (react_1.default.createElement(checkbox_1.Checkbox, { disabled: disabled || !enabled.length, checked: allOn, onChange: (on) => {
                    const next = { ...checked };
                    enabled.forEach((i) => (next[i.key] = someOn && !allOn ? false : on));
                    setChecked(next);
                } })) : null,
            react_1.default.createElement(components_1.Text, { style: { marginLeft: showSelectAll && !oneWay ? token.marginXS : 0, fontSize: token.fontSizeSM, color: token.colorText, flex: 1 } }, title),
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } },
                items.filter((i) => checked[i.key]).length,
                "/",
                items.length)));
    };
    const panel = (items, title, side) => (react_1.default.createElement(components_1.View, { style: [
            {
                flex: 1,
                borderWidth: token.lineWidth,
                borderColor: token.colorBorderSecondary,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgContainer,
                overflow: 'hidden',
            },
            listStyle,
        ] },
        header(items, title),
        react_1.default.createElement(components_1.ScrollView, { style: { height: token.controlHeightLG * 4 } }, items.length === 0 ? (react_1.default.createElement(components_1.View, { style: { padding: token.paddingLG, alignItems: 'center' } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextQuaternary } }, "\u7A7A"))) : (items.map((it) => (react_1.default.createElement(components_1.Pressable, { key: it.key, disabled: disabled || it.disabled, onPress: () => {
                if (oneWay) {
                    if (side === 'left')
                        toggleOne(it.key, true);
                }
                else {
                    setChecked((prev) => ({ ...prev, [it.key]: !prev[it.key] }));
                }
            }, style: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: token.paddingSM,
                paddingVertical: token.paddingXS,
                opacity: it.disabled ? 0.45 : 1,
            } },
            oneWay ? (side === 'left' ? (react_1.default.createElement(icon_1.Icon, { name: "plus", size: token.fontSizeSM, color: token.colorPrimary, style: { marginRight: token.marginXS } })) : (react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSizeSM, color: token.colorTextTertiary, style: { marginRight: token.marginXS } }))) : (react_1.default.createElement(checkbox_1.Checkbox, { checked: !!checked[it.key], disabled: true })),
            react_1.default.createElement(components_1.View, { style: { marginLeft: token.marginXS, flex: 1 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } }, it.title),
                it.description != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, it.description)) : null),
            oneWay && side === 'right' ? (react_1.default.createElement(components_1.Pressable, { onPress: () => toggleOne(it.key, false), disabled: disabled, style: { padding: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "right", size: token.fontSizeSM, color: token.colorTextQuaternary, rotate: 180 }))) : null)))))));
    const arrowBtn = (toRight) => {
        const hasSel = dataSource.some((d) => checked[d.key] && !d.disabled && (toRight ? !tKeys.includes(d.key) : tKeys.includes(d.key)));
        const label = operations ? operations[toRight ? 0 : 1] : null;
        return (react_1.default.createElement(components_1.Pressable, { disabled: disabled || !hasSel, onPress: () => move(toRight), style: {
                minWidth: token.controlHeightSM,
                height: token.controlHeightSM,
                paddingHorizontal: label != null ? token.paddingXS : 0,
                borderRadius: token.borderRadius,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: hasSel && !disabled ? token.colorPrimary : token.colorFillTertiary,
            } }, label != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: hasSel && !disabled ? token.colorTextOnPrimaryBackground : token.colorTextQuaternary } }, label)) : (react_1.default.createElement(icon_1.Icon, { name: toRight ? 'right' : 'left', size: token.fontSize, color: hasSel && !disabled ? token.colorTextOnPrimaryBackground : token.colorTextQuaternary }))));
    };
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center' } },
        panel(left, titles ? titles[0] : '源列表', 'left'),
        oneWay ? null : (react_1.default.createElement(components_1.View, { style: { marginHorizontal: token.marginSM, gap: token.marginXS } },
            arrowBtn(true),
            arrowBtn(false))),
        panel(right, titles ? titles[1] : '目标列表', 'right')));
}
