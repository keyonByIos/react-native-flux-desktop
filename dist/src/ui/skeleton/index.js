"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skeleton = void 0;
exports.SkeletonBase = SkeletonBase;
exports.SkeletonAvatar = SkeletonAvatar;
exports.SkeletonButton = SkeletonButton;
exports.SkeletonInput = SkeletonInput;
exports.SkeletonImage = SkeletonImage;
// Skeleton：加载占位。用灰度圆角块拼出「头像 + 标题 + 若干正文行」。
// active 时整块做呼吸脉冲（透明度循环），由 useAnimation 驱动。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const useAnimation_1 = require("../../anim/useAnimation");
const easing_1 = require("../../anim/easing");
const icon_1 = require("../icon");
function SkeletonBase(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Skeleton');
    const { loading = true, active = false, avatar = true, title = true, paragraph = 3, children, style } = props;
    const rows = typeof paragraph === 'number' ? paragraph : paragraph?.rows ?? 3;
    // 呼吸：0.5→1→0.5 循环，映射到不透明度 0.55..1
    const pulse = (0, useAnimation_1.useAnimation)({ duration: 1400, loop: true, easing: easing_1.sinePulse, playing: active && loading });
    if (!loading)
        return react_1.default.createElement(components_1.View, { style: style }, children);
    const shellOpacity = active ? 0.55 + 0.45 * pulse : 1;
    const bg = ct.gradientFromColor;
    const lineH = token.fontSize * token.lineHeight;
    const block = (w, h, key) => (react_1.default.createElement(components_1.View, { key: key, style: { width: w, height: h, borderRadius: ct.borderRadius, backgroundColor: bg } }));
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', opacity: shellOpacity }, style] },
        avatar ? (react_1.default.createElement(components_1.View, { style: {
                width: token.controlHeightLG,
                height: token.controlHeightLG,
                borderRadius: token.controlHeightLG / 2,
                backgroundColor: bg,
                marginRight: token.margin,
            } })) : null,
        react_1.default.createElement(components_1.View, { style: { flex: 1 } },
            title ? (react_1.default.createElement(components_1.View, { style: { marginBottom: token.marginSM } }, block('38%', lineH, 'title'))) : null,
            Array.from({ length: rows }).map((_, i) => (react_1.default.createElement(components_1.View, { key: i, style: { marginBottom: i === rows - 1 ? 0 : token.marginXS } }, block(i === rows - 1 ? '62%' : '100%', lineH, 'p' + i)))))));
}
// ---- Skeleton 元素变体：单独占位块（头像 / 按钮 / 输入框），active 时同样呼吸 ----
function usePulse(active) {
    return (0, useAnimation_1.useAnimation)({ duration: 1400, loop: true, easing: easing_1.sinePulse, playing: !!active });
}
function SkeletonAvatar(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Skeleton');
    const { active, shape = 'circle', size = token.controlHeightLG, style } = props;
    const pulse = usePulse(active);
    return (react_1.default.createElement(components_1.View, { style: [
            { width: size, height: size, borderRadius: shape === 'circle' ? size / 2 : ct.borderRadius, backgroundColor: ct.gradientFromColor, opacity: active ? 0.55 + 0.45 * pulse : 1 },
            style,
        ] }));
}
function SkeletonButton(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Skeleton');
    const { active, size = 'default', style } = props;
    const pulse = usePulse(active);
    const h = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const w = size === 'large' ? token.controlHeightLG * 2.4 : size === 'small' ? token.controlHeightSM * 1.8 : token.controlHeight * 2;
    return (react_1.default.createElement(components_1.View, { style: [{ width: w, height: h, borderRadius: token.borderRadius, backgroundColor: ct.gradientFromColor, opacity: active ? 0.55 + 0.45 * pulse : 1 }, style] }));
}
function SkeletonInput(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Skeleton');
    const { active, size = 'default', style } = props;
    const pulse = usePulse(active);
    const h = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    return (react_1.default.createElement(components_1.View, { style: [{ width: token.controlHeightLG * 3, height: h, borderRadius: token.borderRadius, backgroundColor: ct.gradientFromColor, opacity: active ? 0.55 + 0.45 * pulse : 1 }, style] }));
}
/** 图片占位块（带 picture 图标） */
function SkeletonImage(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Skeleton');
    const { active, style } = props;
    const pulse = usePulse(active);
    return (react_1.default.createElement(components_1.View, { style: [
            {
                width: token.controlHeightLG * 2,
                height: token.controlHeightLG * 1.5,
                borderRadius: ct.borderRadius,
                backgroundColor: ct.gradientFromColor,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: active ? 0.55 + 0.45 * pulse : 1,
            },
            style,
        ] },
        react_1.default.createElement(icon_1.Icon, { name: "picture", size: token.fontSizeLG, color: token.colorTextQuaternary })));
}
/** Skeleton + 元素变体复合导出 */
exports.Skeleton = Object.assign(SkeletonBase, {
    Avatar: SkeletonAvatar,
    Button: SkeletonButton,
    Input: SkeletonInput,
    Image: SkeletonImage,
});
exports.default = exports.Skeleton;
