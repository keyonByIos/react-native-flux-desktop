"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stagger = Stagger;
exports.StaggerItem = StaggerItem;
// Stagger：错峰入场容器。子项依次追加 delay = index * gap，整组像多米诺一样接连落位。
// 实现：Context 下发序号，StaggerItem 用 useAnimation(delay) 播 0→1，按预设插值出样式；
// 播完停在终态（p=1 恒等），静态抓帧只见落位。整组重放：给 Stagger 换 key 强制子树重挂载。
const react_1 = __importDefault(require("react"));
const components_1 = require("../components");
const useAnimation_1 = require("./useAnimation");
const presets_1 = require("./presets");
const StaggerCtx = react_1.default.createContext(null);
/** 包裹一组子项：每个直接子项自动获得递增序号。 */
function Stagger(props) {
    const { children, gap = 60, preset = 'slideUp', animation, delay = 0, style } = props;
    const p = animation ?? presets_1.presets[preset];
    const items = react_1.default.Children.toArray(children);
    return (react_1.default.createElement(components_1.View, { style: style }, items.map((child, i) => (react_1.default.createElement(StaggerCtx.Provider, { key: i, value: { index: i, preset: p, gap, delay } }, child)))));
}
/** 错峰子项：在 <Stagger> 内按序号延迟入场；脱离 Stagger 使用时等价 MoveIn(slideUp)。 */
function StaggerItem(props) {
    const { children, style } = props;
    const ctx = react_1.default.useContext(StaggerCtx);
    const preset = ctx?.preset ?? presets_1.presets.slideUp;
    const p = (0, useAnimation_1.useAnimation)({
        duration: preset.duration,
        easing: preset.easing,
        delay: (ctx?.delay ?? 0) + (ctx?.index ?? 0) * (ctx?.gap ?? 60),
    });
    return react_1.default.createElement(components_1.View, { style: [(0, presets_1.styleAt)(preset, p), style] }, children);
}
