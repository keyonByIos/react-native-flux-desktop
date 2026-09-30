"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnimation = useAnimation;
// useAnimation：订阅 ticker，把时间映射成 0..1 进度并逐帧 setState 驱动重绘。
// loop=true 为锯齿循环（旋转/呼吸），loop=false 播完自动停在 1 并退订（入场）。
const react_1 = require("react");
const ticker_1 = require("./ticker");
const ConfigContext_1 = require("../theme/ConfigContext");
const easing_1 = require("./easing");
function useAnimation(options = {}) {
    const { duration = 1000, delay = 0, loop = false, easing = easing_1.linear, playing = true } = options;
    const enabled = (0, ConfigContext_1.useAnimationEnabled)();
    // 动画关闭 / 未播放时直接给终值 1（循环动效停在末态，不逐帧跑）
    const [progress, setProgress] = (0, react_1.useState)(() => (!enabled || !playing ? 1 : 0));
    const easingRef = (0, react_1.useRef)(easing);
    easingRef.current = easing;
    (0, react_1.useEffect)(() => {
        if (!enabled || !playing) {
            setProgress(1);
            return;
        }
        let start = null;
        let inDelay = delay > 0; // 延迟段只报一次 0，不逐帧空转 setState
        let stop = () => { };
        stop = (0, ticker_1.subscribe)((now) => {
            if (start == null)
                start = now;
            const dur = duration <= 0 ? 1 : duration;
            let t = (now - start - delay) / dur;
            if (t < 0) {
                if (inDelay) {
                    inDelay = false;
                    setProgress(0);
                }
                return;
            }
            inDelay = false;
            if (loop) {
                t = t % 1;
                setProgress(easingRef.current(t));
            }
            else if (t >= 1) {
                setProgress(1);
                stop();
            }
            else {
                setProgress(easingRef.current(t));
            }
        });
        return () => stop();
    }, [playing, duration, delay, loop, enabled]);
    return enabled ? progress : 1;
}
