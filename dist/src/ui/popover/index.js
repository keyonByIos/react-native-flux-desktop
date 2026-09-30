"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Popover = Popover;
// POPOVER：点击触发器展开气泡卡片。无 portal，面板绝对定位居中对齐触发器，小箭头用 45° 旋转方块。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const FadeIn_1 = require("../../anim/FadeIn");
const useOverlayGate_1 = require("../../events/useOverlayGate");
const ARROW = 6;
const DIAMOND = ARROW * 2;
function Popover(props) {
    const { token } = (0, theme_1.useToken)();
    const { title, content, children, open, placement = 'bottom', trigger = 'click', color, arrow = true, style, onOpenChange } = props;
    const [inner, setInner] = react_1.default.useState(false);
    const show = open !== undefined ? open : inner;
    const [tBox, setTBox] = react_1.default.useState({ w: 0, h: 0 }); // 触发器尺寸
    const [pBox, setPBox] = react_1.default.useState({ w: 0, h: 0 }); // 面板尺寸
    // 点击空白处关闭 + 同屏互斥（仅 click 触发；hover/受控不参与）
    const { onTriggerAbs, onPanelAbs } = (0, useOverlayGate_1.useOverlayGate)(show && trigger === 'click', () => {
        if (open === undefined)
            setInner(false);
        onOpenChange && onOpenChange(false);
    });
    const toggle = () => {
        if (trigger === 'none' || trigger === 'hover')
            return;
        const next = !show;
        if (open === undefined)
            setInner(next);
        onOpenChange && onOpenChange(next);
    };
    // hover 触发时协调“触发器↔面板”的移入移出，延迟关闭避免鼠标穿越缝隙时即闪退
    const closeTimer = react_1.default.useRef(null);
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
        closeTimer.current = setTimeout(() => { if (open === undefined)
            setInner(false); onOpenChange && onOpenChange(false); }, 150);
    };
    const hoverEnter = () => {
        if (trigger !== 'hover')
            return;
        cancelClose();
        if (open === undefined)
            setInner(true);
        onOpenChange && onOpenChange(true);
    };
    const hoverLeave = () => { scheduleClose(); };
    const protrude = (DIAMOND / 2) * Math.SQRT2;
    const gap = (arrow ? token.marginXXS + protrude : token.marginXXS);
    const bg = color ?? token.colorBgElevated;
    // 居中对齐：top/bottom 水平居中于触发器，left/right 垂直居中于触发器
    const cx = (tBox.w - pBox.w) / 2;
    const cy = (tBox.h - pBox.h) / 2;
    const pos = placement === 'top'
        ? { bottom: tBox.h + gap, left: cx }
        : placement === 'left'
            ? { right: tBox.w + gap, top: cy }
            : placement === 'right'
                ? { left: tBox.w + gap, top: cy }
                : { top: tBox.h + gap, left: cx };
    // 箭头：45° 旋转方块，中心落在面板靠触发器一侧的边中点
    const arrowNode = !arrow ? null : (() => {
        const half = DIAMOND / 2;
        const common = {
            position: 'absolute',
            width: DIAMOND,
            height: DIAMOND,
            backgroundColor: bg,
            transform: [{ rotate: '45deg' }],
        };
        if (placement === 'top')
            return react_1.default.createElement(components_1.View, { style: [common, { left: pBox.w / 2 - half, top: pBox.h - half }] });
        if (placement === 'bottom')
            return react_1.default.createElement(components_1.View, { style: [common, { left: pBox.w / 2 - half, top: -half }] });
        if (placement === 'left')
            return react_1.default.createElement(components_1.View, { style: [common, { left: pBox.w - half, top: pBox.h / 2 - half }] });
        return react_1.default.createElement(components_1.View, { style: [common, { left: -half, top: pBox.h / 2 - half }] });
    })();
    const panelStyle = {
        position: 'absolute',
        zIndex: 1070,
        minWidth: token.controlHeightLG * 4,
        padding: token.padding,
        borderRadius: token.borderRadiusLG,
        backgroundColor: bg,
        // 浮层投影（painter 仅作用于背景层）：浅色下 colorBgElevated≈页面底，无投影则面板“隐形”
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowOpacity: 1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        ...pos,
    };
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style] },
        react_1.default.createElement(components_1.View, { onLayout: (e) => setTBox({ w: e.nativeEvent.layout.w, h: e.nativeEvent.layout.h }), onLayoutAbs: onTriggerAbs }, children),
        react_1.default.createElement(components_1.Pressable, { onPress: toggle, onMouseEnter: hoverEnter, onMouseLeave: hoverLeave, style: { position: 'absolute', left: 0, top: 0, width: tBox.w, height: tBox.h } }),
        show ? (react_1.default.createElement(components_1.View, { onLayoutAbs: onPanelAbs, onLayout: (e) => setPBox({ w: e.nativeEvent.layout.w, h: e.nativeEvent.layout.h }), style: panelStyle },
            arrowNode,
            react_1.default.createElement(components_1.Pressable, { onPressIn: () => undefined, onMouseEnter: hoverEnter, onMouseLeave: hoverLeave },
                react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160 },
                    title ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, fontWeight: '600', color: token.colorText, marginBottom: token.marginXS } }, title)) : null,
                    typeof content === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } }, content)) : (content))))) : null));
}
exports.default = Popover;
