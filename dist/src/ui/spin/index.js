"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spin = Spin;
// Spin：加载中指示器。默认指示器是一段绕中心旋转的弧线（Icon + rotate 动画）。
// 参考 antd：size / spinning / tip / indicator / 包裹 children 时的遮罩态。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useAnimation_1 = require("../../anim/useAnimation");
function Spin(props) {
    const { token } = (0, theme_1.useToken)();
    const { spinning = true, size = 'default', indicator, tip, children, style } = props;
    const d = size === 'small' ? token.controlHeightSM : size === 'large' ? token.controlHeightLG : token.controlHeight;
    const angle = (0, useAnimation_1.useAnimation)({ duration: 900, loop: true, playing: spinning }) * 360;
    const dot = indicator != null ? (react_1.default.createElement(components_1.View, { style: { width: d, height: d, alignItems: 'center', justifyContent: 'center' } }, indicator)) : (react_1.default.createElement(icon_1.Icon, { name: "loading", size: d, color: token.colorPrimary, strokeWidth: 2.5, rotate: angle }));
    // 包裹内容形态：内容变暗，指示器 + tip 绝对居中覆盖其上（对齐 antd）
    if (children != null) {
        return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style] },
            react_1.default.createElement(components_1.View, { style: { opacity: spinning ? 0.5 : 1 } }, children),
            spinning ? (react_1.default.createElement(components_1.View, { style: {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                } },
                dot,
                tip != null ? (react_1.default.createElement(components_1.Text, { style: { marginTop: token.marginXS, fontSize: token.fontSize, color: token.colorTextTertiary } }, tip)) : null)) : null));
    }
    // 独立形态
    if (!spinning)
        return react_1.default.createElement(components_1.View, { style: style });
    return (react_1.default.createElement(components_1.View, { style: [{ alignItems: 'center', justifyContent: 'center' }, style] },
        dot,
        tip != null ? (react_1.default.createElement(components_1.Text, { style: { marginTop: token.marginXS, fontSize: token.fontSize, color: token.colorTextTertiary } }, tip)) : null));
}
exports.default = Spin;
