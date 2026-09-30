"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Carousel = Carousel;
// Carousel：走马灯。无手势环境下的最优形态 —— 自动播放 + 圆点 + 左右箭头，
// 切换用 keyed 重挂载的方向性「平移 + 淡入」（随前进/后退来向滑入），不依赖手势。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useAnimation_1 = require("../../anim/useAnimation");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const usePreloadImages_1 = require("../image/usePreloadImages");
/** 切换动画：来向平移 + 淡入。dir=1 从右滑入，dir=-1 从左滑入。 */
function SlideFade(props) {
    const { children, dir = 1 } = props;
    const p = (0, useAnimation_1.useAnimation)({ duration: 380, easing: easing_1.easeOutCubic });
    const DIST = 72;
    const dx = dir * (1 - p) * DIST;
    return (react_1.default.createElement(components_1.View, { style: { flex: 1, opacity: p, transform: [{ translateX: dx }] } }, children));
}
/** 指示符：形状（拉长条 vs 圆点）说明选中，不做特殊着色；宽度用补间在切换时平滑形变。 */
function Dot(props) {
    const { active, vertical, base, color } = props;
    const len = (0, useTween_1.useTween)(active ? base * 3 : base, 280, easing_1.easeOutCubic);
    return (react_1.default.createElement(components_1.View, { style: {
            width: vertical ? base : len,
            height: vertical ? len : base,
            borderRadius: base / 2,
            backgroundColor: color,
        } }));
}
function Carousel(props) {
    const { token } = (0, theme_1.useToken)();
    const { slides, autoPlay = 4000, arrows = true, dots = true, dotPosition = 'bottom', infinite = true, activeIndex, defaultActiveIndex = 0, onChange, height = 200, preload, style } = props;
    const [inner, setInner] = react_1.default.useState(defaultActiveIndex);
    const cur = activeIndex !== undefined ? activeIndex : inner;
    // 预加载：挂载即把各屏图片解码入 painter 缓存，轮播到对应屏时直接命中、无首帧留白
    (0, usePreloadImages_1.usePreloadImages)(preload ?? []);
    // 派生切换方向：渲染期比较 cur 与上一帧，得出新屏的来向（前进 dir=1 / 后退 dir=-1），循环时取最短弧。
    const prevCurRef = react_1.default.useRef(cur);
    const dirRef = react_1.default.useRef(1);
    if (prevCurRef.current !== cur) {
        const delta = cur - prevCurRef.current;
        if (infinite && Math.abs(delta) > slides.length / 2) {
            dirRef.current = delta > 0 ? -1 : 1; // 跨尾/头回绕：实际是反方向短移
        }
        else {
            dirRef.current = delta >= 0 ? 1 : -1;
        }
        prevCurRef.current = cur;
    }
    react_1.default.useEffect(() => {
        if (!autoPlay || slides.length <= 1)
            return;
        const t = setInterval(() => {
            const next = infinite ? (cur + 1) % slides.length : Math.min(cur + 1, slides.length - 1);
            if (activeIndex === undefined)
                setInner(next);
            onChange && onChange(next);
        }, autoPlay);
        return () => clearInterval(t);
    }, [cur, autoPlay, slides.length]);
    function go(i) {
        const next = infinite ? (i + slides.length) % slides.length : Math.max(0, Math.min(i, slides.length - 1));
        if (activeIndex === undefined)
            setInner(next);
        onChange && onChange(next);
    }
    const verticalDots = dotPosition === 'left' || dotPosition === 'right';
    const dot = token.paddingXXS;
    return (react_1.default.createElement(components_1.View, { style: [
            { height, borderRadius: token.borderRadiusLG, overflow: 'hidden', backgroundColor: token.colorBgContainer },
            style,
        ] },
        react_1.default.createElement(SlideFade, { key: cur, dir: dirRef.current }, slides[cur]),
        dots && slides.length > 1 ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                flexDirection: verticalDots ? 'column' : 'row',
                justifyContent: 'center',
                alignItems: 'center',
                top: dotPosition === 'top' ? token.paddingXS : verticalDots ? 0 : undefined,
                bottom: dotPosition === 'bottom' ? token.paddingXS : verticalDots ? 0 : undefined,
                left: dotPosition === 'left' ? token.paddingXS : verticalDots ? undefined : 0,
                right: dotPosition === 'right' ? token.paddingXS : verticalDots ? undefined : 0,
            } }, slides.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: i, onPress: () => go(i), style: { padding: token.paddingXXS } },
            react_1.default.createElement(Dot, { active: i === cur, vertical: verticalDots, base: dot, color: token.colorTextTertiary })))))) : null,
        arrows && slides.length > 1 ? (react_1.default.createElement(react_1.default.Fragment, null,
            infinite || cur > 0 ? (react_1.default.createElement(components_1.Pressable, { onPress: () => go(cur - 1), style: {
                    position: 'absolute',
                    left: token.paddingXS,
                    top: 0,
                    bottom: 0,
                    width: token.controlHeightSM,
                    alignItems: 'center',
                    justifyContent: 'center',
                } },
                react_1.default.createElement(icon_1.Icon, { name: "left", size: token.fontSizeLG, color: token.colorTextTertiary, strokeWidth: 2.5 }))) : null,
            infinite || cur < slides.length - 1 ? (react_1.default.createElement(components_1.Pressable, { onPress: () => go(cur + 1), style: {
                    position: 'absolute',
                    right: token.paddingXS,
                    top: 0,
                    bottom: 0,
                    width: token.controlHeightSM,
                    alignItems: 'center',
                    justifyContent: 'center',
                } },
                react_1.default.createElement(icon_1.Icon, { name: "right", size: token.fontSizeLG, color: token.colorTextTertiary, strokeWidth: 2.5 }))) : null)) : null));
}
exports.default = Carousel;
