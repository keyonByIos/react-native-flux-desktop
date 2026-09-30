"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackTop = BackTop;
// BackTop：返回按钮容器。滚动超过阈值浮现，点击回顶。
// 管线路径：ScrollView.onScroll 上报偏移 → BackTop 显示 → onPress 里把受控 scrollY 归零。
// 对齐 antd：visibilityHeight / prefix / onClick；淡入淡出用 useTween。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const useTween_1 = require("../../anim/useTween");
const icon_1 = require("../icon");
function BackTop(props) {
    const { token } = (0, theme_1.useToken)();
    const { scrollY, visibilityHeight = 120, left = 0, top = 0, onPress, children, style } = props;
    const visible = scrollY > visibilityHeight;
    // 浮现过渡：opacity 0..1 + 轻微上移，都吃同一个 tween
    const t = (0, useTween_1.useTween)(visible ? 1 : 0, 250);
    if (t <= 0.01 && !visible)
        return react_1.default.createElement(components_1.View, { style: { position: 'absolute', left, top, width: 0, height: 0 } });
    const d = token.controlHeightLG;
    return (react_1.default.createElement(components_1.View, { style: [
            { position: 'absolute', left, top: top - (1 - t) * token.marginXS, opacity: t },
            style,
        ] },
        react_1.default.createElement(components_1.Pressable, { onPress: onPress, style: {
                width: d,
                height: d,
                borderRadius: d / 2,
                backgroundColor: token.colorBgContainer,
                borderWidth: token.lineWidth,
                borderColor: token.colorBorderSecondary,
                alignItems: 'center',
                justifyContent: 'center',
            } }, children != null ? (react_1.default.createElement(components_1.View, null, children)) : (react_1.default.createElement(icon_1.Icon, { name: "arrowUp", size: token.fontSizeLG, color: token.colorText })))));
}
exports.default = BackTop;
