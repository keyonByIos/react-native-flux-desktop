"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabs = Tabs;
// Tabs：参考 antd v5 items 配置式。line（下划线）/ card（卡片）/ editable-card（可增删）三态，
// tabPosition 四向（上/下/左/右）、size 三档、tabBarGutter 间距；受控 + 非受控，选中项内容渲染在标签栏对应侧。
// line 型滑动墨条：onLayout 报几何，useTween 补间跟随 active（横向追 x/w，纵向追 y/h）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useAnimation_1 = require("../../anim/useAnimation");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
/** 内容淡入：key 随选中项变化重挂载，触发一次 0→1 透明度 */
function FadeIn(props) {
    const p = (0, useAnimation_1.useAnimation)({ duration: 240, easing: easing_1.easeOutCubic });
    return react_1.default.createElement(components_1.View, { style: { opacity: p } }, props.children);
}
function Tabs(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Tabs');
    const { items, activeKey, defaultActiveKey, onChange, type = 'line', centered, tabBarExtraContent, size = 'middle', tabPosition = 'top', tabBarGutter, onEdit, hideAdd, style, } = props;
    const isCard = type === 'card' || type === 'editable-card';
    const editable = type === 'editable-card';
    const vertical = tabPosition === 'left' || tabPosition === 'right';
    const gutter = tabBarGutter ?? ct.horizontalItemGutter;
    const [inner, setInner] = react_1.default.useState(activeKey !== undefined ? activeKey : defaultActiveKey ?? (items[0] ? items[0].key : ''));
    const active = activeKey !== undefined ? activeKey : inner;
    const activeItem = items.find((i) => i.key === active);
    function select(key) {
        if (activeKey === undefined)
            setInner(key);
        onChange && onChange(key);
    }
    const font = size === 'large' ? token.fontSizeLG : size === 'small' ? token.fontSizeSM : token.fontSize;
    const padBlock = size === 'small' ? Math.round(ct.itemPaddingBlock * 0.6) : ct.itemPaddingBlock;
    const padInline = size === 'small' ? Math.round(ct.itemPaddingInline * 0.6) : ct.itemPaddingInline;
    const renderIcon = (icon, fg) => typeof icon === 'string' ? react_1.default.createElement(icon_1.Icon, { name: icon, size: font, color: fg }) : icon;
    // 滑动墨条：每个 tab 用 onLayout 报几何，墨条绝对定位跟随 active，useTween 补间
    const [rects, setRects] = react_1.default.useState({});
    const reportRect = (key) => (e) => {
        const { x, y, w, h } = e.nativeEvent.layout;
        setRects((prev) => {
            const old = prev[key];
            if (old && old.x === x && old.y === y && old.w === w && old.h === h)
                return prev;
            return { ...prev, [key]: { x, y, w, h } };
        });
    };
    const activeRect = rects[active];
    const inkX = (0, useTween_1.useTween)(activeRect ? activeRect.x : 0, 260, easing_1.easeOutCubic);
    const inkW = (0, useTween_1.useTween)(activeRect ? activeRect.w : 0, 260, easing_1.easeOutCubic);
    const inkY = (0, useTween_1.useTween)(activeRect ? activeRect.y : 0, 260, easing_1.easeOutCubic);
    const inkH = (0, useTween_1.useTween)(activeRect ? activeRect.h : 0, 260, easing_1.easeOutCubic);
    const renderTab = (tab) => {
        const isActive = tab.key === active;
        const disabled = !!tab.disabled;
        const fg = disabled ? token.colorTextQuaternary : isActive ? token.colorPrimary : token.colorText;
        const tabStyle = isCard
            ? {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: padBlock,
                paddingHorizontal: padInline,
                borderTopLeftRadius: ct.itemPaddingBlock / 2,
                borderTopRightRadius: ct.itemPaddingBlock / 2,
                borderWidth: token.lineWidth,
                borderColor: isActive ? token.colorBorderSecondary : 'transparent',
                backgroundColor: isActive ? token.colorBgContainer : token.colorFillQuaternary,
            }
            : {
                flexDirection: vertical ? 'column' : 'row',
                alignItems: 'center',
                paddingVertical: padBlock,
                paddingHorizontal: padInline,
                ...(tabPosition === 'top' ? { marginBottom: -token.lineWidth } : {}),
                ...(tabPosition === 'bottom' ? { marginTop: -token.lineWidth } : {}),
                ...(tabPosition === 'left' ? { marginRight: -token.lineWidth } : {}),
                ...(tabPosition === 'right' ? { marginLeft: -token.lineWidth } : {}),
            };
        const closable = editable && tab.closable !== false;
        return (react_1.default.createElement(components_1.Pressable, { key: tab.key, disabled: disabled, style: tabStyle, onLayout: reportRect(tab.key), onPress: () => !disabled && select(tab.key) },
            tab.icon != null ? (react_1.default.createElement(components_1.View, { style: {
                    marginRight: !vertical && tab.label != null ? token.marginXXS : 0,
                    marginBottom: vertical && tab.label != null ? token.marginXXS : 0,
                } }, renderIcon(tab.icon, fg))) : null,
            tab.label != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: font, color: fg, fontWeight: isActive ? '500' : '400' } }, tab.label)) : null,
            closable ? (react_1.default.createElement(components_1.Pressable, { onPress: () => onEdit && onEdit(tab.key, 'remove'), style: { marginLeft: token.marginXS } },
                react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSizeSM, color: fg }))) : null));
    };
    // 标签栏边框（line 型按位置贴对应边）
    const lineBorder = type !== 'line'
        ? {}
        : tabPosition === 'top'
            ? { borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary }
            : tabPosition === 'bottom'
                ? { borderTopWidth: token.lineWidth, borderTopColor: token.colorBorderSecondary }
                : tabPosition === 'left'
                    ? { borderRightWidth: token.lineWidth, borderRightColor: token.colorBorderSecondary }
                    : { borderLeftWidth: token.lineWidth, borderLeftColor: token.colorBorderSecondary };
    const barStyle = {
        flexDirection: vertical ? 'column' : 'row',
        alignItems: vertical ? 'flex-start' : tabPosition === 'top' ? 'flex-end' : 'flex-start',
        justifyContent: !vertical && centered ? 'center' : 'flex-start',
        gap: gutter,
    };
    const addBtn = editable && !hideAdd ? (react_1.default.createElement(components_1.Pressable, { onPress: () => onEdit && onEdit(undefined, 'add'), style: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: padBlock,
            paddingHorizontal: padInline,
            borderTopLeftRadius: ct.itemPaddingBlock / 2,
            borderTopRightRadius: ct.itemPaddingBlock / 2,
            borderWidth: token.lineWidth,
            borderColor: token.colorBorderSecondary,
            backgroundColor: token.colorFillQuaternary,
        } },
        react_1.default.createElement(icon_1.Icon, { name: "plus", size: font, color: token.colorText }))) : null;
    const inkBar = type === 'line' && activeRect ? (vertical ? (react_1.default.createElement(components_1.View, { style: {
            position: 'absolute',
            top: inkY,
            [tabPosition === 'left' ? 'right' : 'left']: 0,
            height: inkH,
            width: ct.inkBarSize,
            borderRadius: ct.inkBarSize / 2,
            backgroundColor: token.colorPrimary,
            opacity: inkH > 0 ? 1 : 0,
        } })) : (react_1.default.createElement(components_1.View, { style: {
            position: 'absolute',
            left: inkX,
            [tabPosition === 'top' ? 'bottom' : 'top']: 0,
            width: inkW,
            height: ct.inkBarSize,
            borderRadius: ct.inkBarSize / 2,
            backgroundColor: token.colorPrimary,
            opacity: inkW > 0 ? 1 : 0,
        } }))) : null;
    const bar = (react_1.default.createElement(components_1.View, { style: [barStyle, lineBorder, vertical ? {} : { position: 'relative' }] },
        items.map(renderTab),
        addBtn,
        tabBarExtraContent != null ? (react_1.default.createElement(components_1.View, { style: vertical ? { marginTop: 'auto', alignSelf: 'center' } : { marginLeft: 'auto', alignSelf: 'center' } }, tabBarExtraContent)) : null,
        inkBar));
    const content = activeItem && activeItem.children != null ? (react_1.default.createElement(components_1.View, { style: {
            flex: vertical ? 1 : undefined,
            ...(tabPosition === 'top'
                ? { paddingTop: token.paddingLG }
                : tabPosition === 'bottom'
                    ? { paddingBottom: token.paddingLG }
                    : tabPosition === 'left'
                        ? { paddingLeft: token.paddingLG }
                        : { paddingRight: token.paddingLG }),
        } },
        react_1.default.createElement(FadeIn, { key: active }, activeItem.children))) : null;
    const barFirst = tabPosition === 'top' || tabPosition === 'left';
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: vertical ? 'row' : 'column' }, style] }, barFirst ? (react_1.default.createElement(react_1.default.Fragment, null,
        bar,
        content)) : (react_1.default.createElement(react_1.default.Fragment, null,
        content,
        bar))));
}
exports.default = Tabs;
