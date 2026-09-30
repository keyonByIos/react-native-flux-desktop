"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tooltip = Tooltip;
// TOOLTIP：鼠标悬停/点击浮现的提示气泡。桌面端有 MouseMove 命中派发（host），故 hover 触发可用。
// 无 portal：气泡绝对定位于触发器旁（onLayout 实测触发器宽高定位），靠文档顺序覆盖。
// 对齐 antd v5：placement 四向、color 自定义底色、arrow 小箭头、trigger hover/click。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const FadeIn_1 = require("../../anim/FadeIn");
/** 依据背景亮度挑选高对比前景（避免暗色主题下 spotlight 翻白导致文字不可见） */
function contrastOn(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
}
const ARROW = 6; // 箭头三角：以 45° 旋转方块绘制，DIAMOND 为方块边长
const DIAMOND = ARROW * 2;
function Tooltip(props) {
    const { token } = (0, theme_1.useToken)();
    const { title, children, placement = 'top', trigger = 'hover', arrow = true, color, open, style } = props;
    const [inner, setInner] = react_1.default.useState(false);
    const show = open !== undefined ? open : inner;
    const [box, setBox] = react_1.default.useState({ w: 0, h: 0 }); // 触发器尺寸
    const [tip, setTip] = react_1.default.useState({ w: 0, h: 0 }); // 气泡尺寸（onLayout 实测，用于居中对齐 + 箭头落位）
    // 气泡↔触发器间距 = 基础间距 + 箭头突出量（方块对角的一半）
    const protrude = (DIAMOND / 2) * Math.SQRT2;
    const gap = arrow ? token.marginXXS + protrude : token.marginXXS;
    const bg = color ?? 'rgba(0,0,0,0.75)'; // 沉浸式暗色气泡，不随主题翻白
    const fg = contrastOn(bg);
    const enter = () => {
        if (open === undefined && trigger === 'hover')
            setInner(true);
    };
    const leave = () => {
        if (open === undefined && trigger === 'hover')
            setInner(false);
    };
    const click = () => {
        if (open === undefined && trigger === 'click')
            setInner((v) => !v);
    };
    // 居中对齐：top/bottom 水平居中于触发器，left/right 垂直居中于触发器
    const cx = (box.w - tip.w) / 2;
    const cy = (box.h - tip.h) / 2;
    const pos = placement === 'top'
        ? { bottom: box.h + gap, left: cx }
        : placement === 'left'
            ? { right: box.w + gap, top: cy }
            : placement === 'right'
                ? { left: box.w + gap, top: cy }
                : { top: box.h + gap, left: cx };
    // 箭头：本 painter 的 border 是矩形填充（画不出 CSS 三角），故用 45° 旋转方块——
    // 方块中心落在气泡靠触发器一侧的边中点，外半露出成三角、内半与气泡同色隐形。
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
            return react_1.default.createElement(components_1.View, { style: [common, { left: tip.w / 2 - half, top: tip.h - half }] });
        if (placement === 'bottom')
            return react_1.default.createElement(components_1.View, { style: [common, { left: tip.w / 2 - half, top: -half }] });
        if (placement === 'left')
            return react_1.default.createElement(components_1.View, { style: [common, { left: tip.w - half, top: tip.h / 2 - half }] });
        return react_1.default.createElement(components_1.View, { style: [common, { left: -half, top: tip.h / 2 - half }] });
    })();
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style] },
        react_1.default.createElement(components_1.View, { onLayout: (e) => setBox({ w: e.nativeEvent.layout.w, h: e.nativeEvent.layout.h }) }, children),
        react_1.default.createElement(components_1.Pressable, { onMouseEnter: enter, onMouseLeave: leave, onPress: click, style: { position: 'absolute', left: 0, top: 0, width: box.w, height: box.h } }),
        show && title ? (react_1.default.createElement(components_1.Pressable, { onMouseEnter: enter, onMouseLeave: leave, onPressIn: () => undefined, style: { position: 'absolute', zIndex: 1070, ...pos }, onLayout: (e) => setTip({ w: e.nativeEvent.layout.w, h: e.nativeEvent.layout.h }) },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 140, style: {
                    maxWidth: token.controlHeightLG * 6,
                    paddingHorizontal: token.paddingXS,
                    paddingVertical: token.paddingXXS,
                    borderRadius: token.borderRadius,
                    backgroundColor: bg,
                } },
                arrowNode,
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: fg } }, title)))) : null));
}
exports.default = Tooltip;
