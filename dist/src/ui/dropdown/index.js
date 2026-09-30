"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dropdown = void 0;
// DROPDOWN：下拉菜单。触发器（children）点击/悬停展开一个菜单面板。
// 无 portal：面板绝对定位于触发器下方（onLayout 实测触发器高定位），靠文档顺序覆盖（同 Popover）。
// 触发命中：children 之上盖一层透明 overlay Pressable 捕获 press/hover——因为若 children 是 Button
// （内部自带 Pressable），findPressable 只取最内层，外层触发器会被吞掉，故必须用 overlay 抢回命中。
// antd v5 对齐：items[].children 子菜单（点击行内展开）、menu.onClick(info{key,keyPath})、
// menu.disabled 整表禁用、arrow 箭头、Dropdown.Button 复合按钮。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const button_1 = require("../button");
const FadeIn_1 = require("../../anim/FadeIn");
const useOverlayGate_1 = require("../../events/useOverlayGate");
function DropdownBase(props) {
    const { token } = (0, theme_1.useToken)();
    const { menu, children, trigger = 'click', placement = 'bottomLeft', open, disabled, arrow, style, onOpenChange } = props;
    const { items = [], onClick, selectable, selectedKeys = [], disabled: menuDisabled } = menu;
    const [inner, setInner] = react_1.default.useState(false);
    const show = (open !== undefined ? open : inner) && !menuDisabled && !disabled;
    const [triggerH, setTriggerH] = react_1.default.useState(0);
    const [tbox, setTbox] = react_1.default.useState({ w: 0, h: 0 });
    /** 展开中的子菜单父项 key 集合 */
    const [subOpen, setSubOpen] = react_1.default.useState({});
    const closeTimer = react_1.default.useRef(null);
    const set = (v) => {
        if (open === undefined)
            setInner(v);
        onOpenChange && onOpenChange(v);
    };
    const toggle = () => {
        if (disabled || menuDisabled || trigger !== 'click')
            return;
        set(!show);
    };
    const cancelClose = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };
    const scheduleClose = () => {
        if (trigger !== 'hover')
            return;
        cancelClose();
        closeTimer.current = setTimeout(() => set(false), 150);
    };
    const hoverEnter = () => {
        if (trigger !== 'hover' || disabled || menuDisabled)
            return;
        cancelClose();
        set(true);
    };
    const hoverLeave = () => {
        scheduleClose();
    };
    const pick = (it, keyPath) => {
        if (it.disabled)
            return;
        if (it.children && it.children.length) {
            // 父项：只展开/收起子层，不关闭面板、不触发选中
            setSubOpen((prev) => ({ ...prev, [it.key]: !prev[it.key] }));
            return;
        }
        onClick && onClick(it.key, { key: it.key, keyPath });
        if (open === undefined)
            setInner(false);
    };
    // 点击空白处关闭 + 同屏互斥：把触发器框与面板框的绝对矩形登记给协调器，
    // 宿主每次点击广播坐标，落在两框之外即 close()。受控常驻展开/hover 触发不参与。
    const gateActive = show && trigger === 'click';
    const { onTriggerAbs, onPanelAbs } = (0, useOverlayGate_1.useOverlayGate)(gateActive, () => set(false));
    const gap = token.marginXXS;
    const above = placement.startsWith('top');
    const vertical = above ? { bottom: triggerH + gap } : { top: triggerH + gap };
    const horizontal = placement.endsWith('Right') ? { right: 0 } : { left: 0 };
    const panelStyle = {
        position: 'absolute',
        zIndex: 1050,
        minWidth: token.controlHeightLG * 4,
        paddingVertical: token.paddingXXS,
        borderWidth: token.lineWidth,
        borderStyle: 'solid',
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
        backgroundColor: token.colorBgElevated,
        ...vertical,
        ...horizontal,
    };
    // 箭头：45° 旋转方块，与面板同为容器直接子节点(绝对定位)，骑在面板靠触发器一侧的外沿上。
    // 面板外沿相对容器的 y：下弹为 triggerH+gap；上弹面板用 bottom:triggerH+gap 定高，其底边落在 y=-gap。
    // 箭头中心对齐该外沿→上半露两条尖角边指向触发器，下半(含多余边线)被面板同色底盖住。
    // zIndex 与面板同值(1050)：文档序在面板之前→先绘被面板压住；高于 overlay(0) 避免死区。
    const aDiag = Math.SQRT2 * token.marginXS;
    const edgeY = above ? -gap : triggerH + gap;
    const arrowTop = edgeY - token.marginXS / 2;
    const arrowLeft = Math.max(token.padding, tbox.w / 2 - aDiag / 2);
    const arrowNode = arrow ? (react_1.default.createElement(components_1.View, { style: {
            position: 'absolute',
            zIndex: 1050,
            width: token.marginXS,
            height: token.marginXS,
            backgroundColor: token.colorBgElevated,
            borderColor: token.colorBorderSecondary,
            borderWidth: token.lineWidth,
            transform: [{ rotate: '45deg' }],
            top: arrowTop,
            left: arrowLeft,
        } })) : null;
    // 覆盖条：面板后绘、其整条边框线会横穿箭头菱形的"嘴"形成断层线——用同色小条(高=边框带、
    // 宽=菱形最宽两点间距 aDiag)盖掉嘴内的边框段，两条尖角边恰好落在断点上与面板边框平滑相接
    // (antd 同款)。文档序排在面板之后 + zIndex 更高 → 盖在面板边框之上；断点外侧边框不受影响。
    const coverW = aDiag;
    const arrowCover = arrow ? (react_1.default.createElement(components_1.View, { style: {
            position: 'absolute',
            zIndex: 1051,
            width: coverW,
            height: token.lineWidth + 1,
            backgroundColor: token.colorBgElevated,
            top: edgeY - (above ? token.lineWidth + 0.5 : 0.5),
            left: arrowLeft + token.marginXS / 2 - coverW / 2,
        } })) : null;
    /** 渲染一条菜单项；sub=true 时缩进一级 */
    const renderItem = (it, keyPath, sub) => {
        if (it.type === 'divider') {
            return react_1.default.createElement(components_1.View, { key: it.key, style: { height: token.lineWidth, backgroundColor: token.colorSplit, marginVertical: token.paddingXXS } });
        }
        const hasChildren = !!(it.children && it.children.length);
        const expanded = !!subOpen[it.key];
        const selected = selectable && selectedKeys.includes(it.key);
        const fg = it.danger ? token.colorError : selected ? token.colorPrimary : token.colorText;
        return (react_1.default.createElement(components_1.View, { key: it.key },
            react_1.default.createElement(components_1.Pressable, { disabled: it.disabled, onPress: () => pick(it, keyPath), onMouseEnter: hoverEnter, onMouseLeave: hoverLeave, style: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: token.marginXS,
                    paddingLeft: sub ? token.paddingLG : token.paddingSM,
                    paddingRight: token.paddingSM,
                    paddingVertical: token.paddingXS,
                    backgroundColor: 'transparent',
                    opacity: it.disabled ? 0.45 : 1,
                } },
                it.icon != null ? (typeof it.icon === 'string' ? (react_1.default.createElement(icon_1.Icon, { name: it.icon, size: token.fontSize, color: fg })) : (it.icon)) : null,
                react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { flex: 1, fontSize: token.fontSize, color: fg, fontWeight: selected ? '500' : '400' } }, it.label),
                selected ? react_1.default.createElement(icon_1.Icon, { name: "check", size: token.fontSizeSM, color: token.colorPrimary, strokeWidth: 3 }) : null,
                hasChildren ? (react_1.default.createElement(icon_1.Icon, { name: expanded ? 'down' : 'right', size: token.fontSizeSM, color: token.colorTextTertiary, strokeWidth: 2.5 })) : null),
            hasChildren && expanded ? it.children.map((c) => renderItem(c, [...keyPath, it.key], true)) : null));
    };
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayoutAbs: onTriggerAbs },
        react_1.default.createElement(components_1.View, { onLayout: (e) => {
                const l = e.nativeEvent.layout;
                setTbox({ w: l.w, h: l.h });
                setTriggerH(l.h);
            } }, children),
        react_1.default.createElement(components_1.Pressable, { disabled: disabled || menuDisabled, onPress: toggle, onMouseEnter: hoverEnter, onMouseLeave: hoverLeave, style: { position: 'absolute', left: 0, top: 0, width: tbox.w, height: tbox.h } }),
        show ? (react_1.default.createElement(react_1.default.Fragment, null,
            arrowNode,
            react_1.default.createElement(components_1.View, { style: panelStyle, onLayoutAbs: onPanelAbs },
                react_1.default.createElement(components_1.Pressable, { onPressIn: () => undefined, onMouseEnter: hoverEnter, onMouseLeave: hoverLeave },
                    react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160 }, items.map((it) => renderItem(it, [it.key], false))))),
            arrowCover)) : null));
}
function DropdownButtonBase(props) {
    const { token } = (0, theme_1.useToken)();
    const { buttons, onClick, type = 'default', menu, ...rest } = props;
    const btnType = type === 'primary' ? 'primary' : 'default';
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center' } },
        react_1.default.createElement(button_1.Button, { type: btnType, onClick: onClick, style: { borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 } }, buttons),
        react_1.default.createElement(exports.Dropdown, { menu: menu, ...rest },
            react_1.default.createElement(button_1.Button, { type: btnType, icon: react_1.default.createElement(icon_1.Icon, { name: "down", size: token.fontSizeSM, color: type === 'primary' ? token.colorTextLightSolid : token.colorText }), style: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } }))));
}
exports.Dropdown = Object.assign(DropdownBase, { Button: DropdownButtonBase });
exports.default = exports.Dropdown;
