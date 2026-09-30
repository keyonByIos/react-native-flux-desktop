"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEnter = useEnter;
exports.FadeIn = FadeIn;
// FadeIn：挂载即淡入的容器（opacity 0→1）。无 transform，故只做透明度渐显——足够给浮层/切页增添入场感。
// useEnter 返回 0→1 进度；每次组件挂载都从头播放（配合 key 强制重挂即可重播）。
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
const components_1 = require("../components");
const ticker_1 = require("./ticker");
const ConfigContext_1 = require("../theme/ConfigContext");
const easing_1 = require("./easing");
function useEnter(duration = 240) {
    const enabled = (0, ConfigContext_1.useAnimationEnabled)();
    const [p, setP] = (0, react_2.useState)(enabled ? 0 : 1);
    (0, react_2.useEffect)(() => {
        // 动画关闭：入场直接落终态 1（可见、无位移）
        if (!enabled) {
            setP(1);
            return;
        }
        let start = null;
        let stop = (0, ticker_1.subscribe)((now) => {
            if (start == null)
                start = now;
            const t = duration <= 0 ? 1 : (now - start) / duration;
            if (t >= 1) {
                setP(1);
                stop();
            }
            else {
                setP((0, easing_1.easeOutCubic)(t));
            }
        });
        return () => stop();
    }, [duration, enabled]);
    return enabled ? p : 1;
}
function FadeIn(props) {
    const { children, duration = 240, style, onLayout } = props;
    const p = useEnter(duration);
    return (react_1.default.createElement(components_1.View, { style: [{ opacity: p }, style], onLayout: onLayout }, children));
}
exports.default = FadeIn;
