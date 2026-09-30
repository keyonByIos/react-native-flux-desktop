"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimePicker = TimePicker;
// TIMEPICKER：触发器显示 HH:mm(:ss)，点开面板在多列（时/分/秒/上下午）点选。
// 无键盘依赖，纯点选；面板绝对定位覆盖（同 Select），不依赖浮层 z 栈。
// 对齐 antd v5：size / status / placement / showSecond / hourStep·minuteStep·secondStep / use12Hours。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
const useOverlayGate_1 = require("../../events/useOverlayGate");
function pad(n) {
    return n < 10 ? `0${n}` : `${n}`;
}
function range(n, step) {
    const a = [];
    for (let i = 0; i < n; i += step)
        a.push(i);
    return a;
}
/** 显示时（1..12）+ 上下午 → 24 小时 */
function to24(displayHour, pm) {
    return (displayHour % 12) + (pm ? 12 : 0);
}
/**
 * 单列时间选项。打开时受控滚动到选中项居中（可见 5 行、居中第 3 行），
 * 短暂（250ms）后释放受控——否则每帧被 applyScrollSemantics 复位到固定偏移，滚轮无法滚动。
 */
function TimeColumn(props) {
    const { token } = (0, theme_1.useToken)();
    const { items, onPick, rowHeight, colWidth } = props;
    const activeIdx = Math.max(0, items.findIndex((x) => x.active));
    const seed = Math.max(0, (activeIdx - 2) * rowHeight);
    const [controlled, setControlled] = react_1.default.useState(true);
    react_1.default.useEffect(() => {
        const t = setTimeout(() => setControlled(false), 250);
        return () => clearTimeout(t);
    }, []);
    return (react_1.default.createElement(components_1.ScrollView, { scrollY: controlled ? seed : undefined, style: { height: rowHeight * 5, width: colWidth } }, items.map((x, i) => (react_1.default.createElement(components_1.Pressable, { key: x.key, onPress: () => onPick(i), style: { height: rowHeight, alignItems: 'center', justifyContent: 'center', borderRadius: token.borderRadius } },
        react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: x.active ? token.colorPrimary : token.colorText, fontWeight: x.active ? '600' : '400' } }, x.label))))));
}
function TimePicker(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue, placeholder = '请选择时间', disabled, allowClear, showSecond, use12Hours, hourStep = 1, minuteStep = 1, secondStep = 1, size = 'middle', status, placement = 'bottomLeft', open, onChange, style, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue);
    const selected = value !== undefined ? value : inner;
    const [expanded, setExpanded] = react_1.default.useState(false);
    const showPanel = open !== undefined ? open : expanded;
    // 点击空白处关闭 + 同屏互斥（受控常驻展开 open / disabled 不参与）
    const { onTriggerAbs, onPanelAbs } = (0, useOverlayGate_1.useOverlayGate)(showPanel && open === undefined && !disabled, () => setExpanded(false));
    const hour = selected ? selected.getHours() : 0;
    const minute = selected ? selected.getMinutes() : 0;
    const second = selected ? selected.getSeconds() : 0;
    const triggerH = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const borderColor = status === 'error' ? token.colorError : status === 'warning' ? token.colorWarning : showPanel ? token.colorPrimary : token.colorBorder;
    const up = placement === 'topLeft' || placement === 'topRight';
    const alignRight = placement === 'bottomRight' || placement === 'topRight';
    const commit = (h, m, s) => {
        const next = new Date(1970, 0, 1, h, m, s);
        if (value === undefined)
            setInner(next);
        onChange && onChange(next);
    };
    const colWidth = token.controlHeightLG * 1.6;
    const rowHeight = token.controlHeight;
    const divider = (react_1.default.createElement(components_1.View, { style: { width: token.lineWidth, alignSelf: 'stretch', backgroundColor: token.colorSplit, marginHorizontal: token.marginXXS } }));
    // 各列数据
    const hourItems = use12Hours
        ? range(12, hourStep).map((i) => ({ key: `h${i}`, label: pad(i + 1), active: (hour % 12 || 12) === i + 1 }))
        : range(24, hourStep).map((i) => ({ key: `h${i}`, label: pad(i), active: hour === i }));
    const minuteItems = range(60, minuteStep).map((i) => ({ key: `m${i}`, label: pad(i), active: minute === i }));
    const secondItems = range(60, secondStep).map((i) => ({ key: `s${i}`, label: pad(i), active: second === i }));
    const pm = hour >= 12;
    const meridianItems = [
        { key: 'am', label: 'AM', active: !pm },
        { key: 'pm', label: 'PM', active: pm },
    ];
    const pickHour = (i) => {
        if (use12Hours)
            commit(to24(i + 1, pm), minute, second);
        else
            commit(range(24, hourStep)[i], minute, second);
    };
    const pickMeridian = (i) => {
        const displayHour = hour % 12 || 12;
        commit(to24(displayHour, i === 1), minute, second);
    };
    const display = selected
        ? use12Hours
            ? `${pad(hour % 12 || 12)}:${pad(minute)}${showSecond ? `:${pad(second)}` : ''} ${hour < 12 ? 'AM' : 'PM'}`
            : `${pad(hour)}:${pad(minute)}${showSecond ? `:${pad(second)}` : ''}`
        : placeholder;
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayoutAbs: onTriggerAbs },
        react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: () => (open === undefined ? setExpanded((v) => !v) : undefined), style: {
                width: token.controlHeightLG * 3,
                height: triggerH,
                paddingHorizontal: token.paddingSM,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgContainer,
                opacity: disabled ? 0.65 : 1,
            } },
            react_1.default.createElement(icon_1.Icon, { name: "clock", size: token.fontSize, color: token.colorTextQuaternary, style: { marginRight: token.marginXS } }),
            react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: token.fontSize, color: selected ? token.colorText : token.colorTextQuaternary } }, display),
            allowClear && selected && !disabled ? (react_1.default.createElement(components_1.Pressable, { onPress: () => {
                    if (value === undefined)
                        setInner(undefined);
                    onChange && onChange(undefined);
                }, style: { paddingHorizontal: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "closeCircle", size: token.fontSizeSM, color: token.colorTextQuaternary }))) : null),
        showPanel ? (react_1.default.createElement(components_1.View, { onLayoutAbs: onPanelAbs, style: {
                position: 'absolute',
                zIndex: 1050,
                left: alignRight ? undefined : 0,
                right: alignRight ? 0 : undefined,
                top: up ? undefined : triggerH + token.marginXXS,
                bottom: up ? triggerH + token.marginXXS : undefined,
                flexDirection: 'row',
                alignItems: 'center',
                padding: token.paddingXXS,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: token.colorBorderSecondary,
                borderRadius: token.borderRadiusLG,
                backgroundColor: token.colorBgElevated,
            } },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160, style: { flexDirection: 'row' } },
                use12Hours ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(TimeColumn, { items: meridianItems, onPick: (i) => pickMeridian(i), rowHeight: rowHeight, colWidth: colWidth }),
                    divider)) : null,
                react_1.default.createElement(TimeColumn, { items: hourItems, onPick: (i) => pickHour(i), rowHeight: rowHeight, colWidth: colWidth }),
                divider,
                react_1.default.createElement(TimeColumn, { items: minuteItems, onPick: (i) => commit(hour, range(60, minuteStep)[i], second), rowHeight: rowHeight, colWidth: colWidth }),
                showSecond ? (react_1.default.createElement(react_1.default.Fragment, null,
                    divider,
                    react_1.default.createElement(TimeColumn, { items: secondItems, onPick: (i) => commit(hour, minute, range(60, secondStep)[i]), rowHeight: rowHeight, colWidth: colWidth }))) : null))) : null));
}
exports.default = TimePicker;
