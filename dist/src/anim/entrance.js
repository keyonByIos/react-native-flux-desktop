"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveIn = MoveIn;
exports.ScaleIn = ScaleIn;
exports.RotateIn = RotateIn;
// 入场变换组件：挂载即播放，复用 useEnter(0→1) + painter 的 transform。
// 与 FadeIn 同构——FadeIn 只动 opacity，这里动 style.transform（可叠 opacity）。
// 播完停在终态（p=1 → 恒等变换），故抓帧/静态截图看到的是落位后的样子。
const react_1 = __importDefault(require("react"));
const components_1 = require("../components");
const FadeIn_1 = require("./FadeIn");
/** 平移入场。direction = 元素「进入时的来向」：up=从下方上移落位，left=从右方左移落位。 */
function MoveIn(props) {
    const { children, direction = 'up', distance = 24, duration = 280, fade = true, style } = props;
    const p = (0, FadeIn_1.useEnter)(duration);
    const k = 1 - p;
    let dx = 0;
    let dy = 0;
    if (direction === 'up')
        dy = distance * k;
    else if (direction === 'down')
        dy = -distance * k;
    else if (direction === 'left')
        dx = distance * k;
    else
        dx = -distance * k;
    const transform = [{ translateX: dx }, { translateY: dy }];
    return (react_1.default.createElement(components_1.View, { style: [{ transform, opacity: fade ? p : 1 }, style] }, children));
}
/** 缩放入场：from → 1。 */
function ScaleIn(props) {
    const { children, from = 0.8, duration = 240, fade = true, style } = props;
    const p = (0, FadeIn_1.useEnter)(duration);
    const s = from + (1 - from) * p;
    return (react_1.default.createElement(components_1.View, { style: [{ transform: [{ scale: s }], opacity: fade ? p : 1 }, style] }, children));
}
/** 旋转入场：from(度) → 0。 */
function RotateIn(props) {
    const { children, from = -90, duration = 320, fade = true, style } = props;
    const p = (0, FadeIn_1.useEnter)(duration);
    const deg = from * (1 - p);
    return (react_1.default.createElement(components_1.View, { style: [{ transform: [{ rotate: `${deg}deg` }], opacity: fade ? p : 1 }, style] }, children));
}
