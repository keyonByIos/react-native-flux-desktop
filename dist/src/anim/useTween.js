"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTween = useTween;
// useTween：把一个数值「补间」到最新 target。target 变化时，从当前显示值缓动过去。
// 适合开关手柄滑动、Tabs 墨条移动、Segmented 滑块等「位置随状态迁移」的场景。
const react_1 = require("react");
const ticker_1 = require("./ticker");
const ConfigContext_1 = require("../theme/ConfigContext");
const easing_1 = require("./easing");
function useTween(target, duration = 220, easing = easing_1.easeOutCubic) {
    const enabled = (0, ConfigContext_1.useAnimationEnabled)();
    const [value, setValue] = (0, react_1.useState)(target);
    const valueRef = (0, react_1.useRef)(value);
    valueRef.current = value;
    const easingRef = (0, react_1.useRef)(easing);
    easingRef.current = easing;
    (0, react_1.useEffect)(() => {
        // 动画关闭：不补间，target 变了直接落终值
        if (!enabled) {
            setValue(target);
            return;
        }
        const from = valueRef.current;
        if (from === target)
            return;
        let start = null;
        let stop = () => { };
        stop = (0, ticker_1.subscribe)((now) => {
            if (start == null)
                start = now;
            const t = duration <= 0 ? 1 : (now - start) / duration;
            if (t >= 1) {
                setValue(target);
                stop();
            }
            else {
                setValue(from + (target - from) * easingRef.current(t));
            }
        });
        return () => stop();
    }, [target, duration, enabled]);
    // 关闭时当帧即返 target（不等 effect），避免开关切换那一帧短暂残留旧补间值
    return enabled ? value : target;
}
