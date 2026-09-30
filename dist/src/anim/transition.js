"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransition = useTransition;
exports.Transition = Transition;
// Transition：声明式进出场。visible 翻 false 后不立即卸载——先播完退场预设再真正移除，
// 补齐「淡出/滑走」这类 RN 条件渲染做不到的语义（对比 FadeIn/MoveIn 只有入场）。
// 实现：外层 held 状态控制挂载区间（exit 时长定时卸载）；进度由 useReplayable 驱动——
// 以「代际+方向」为 token，token 一变即从头重播 0→1，进出场各是一次全新播放。
const react_1 = __importDefault(require("react"));
const components_1 = require("../components");
const ticker_1 = require("./ticker");
const ConfigContext_1 = require("../theme/ConfigContext");
const presets_1 = require("./presets");
const resolve = (p, fallback) => p == null ? fallback : typeof p === 'string' ? presets_1.presets[p] : p;
/** 可重播的 0→1 进度：token 变化即重新从头播放（同一 easing/duration）。 */
function useReplayable(token, duration, easing) {
    const enabled = (0, ConfigContext_1.useAnimationEnabled)();
    const tokRef = react_1.default.useRef(token);
    // 一律从 0 起播：首帧可见=入场起点，首帧隐藏=未挂载不可见；后续方向翻转 token 变即重播
    const [p, setP] = react_1.default.useState(0);
    const pRef = react_1.default.useRef(0);
    pRef.current = p;
    const easingRef = react_1.default.useRef(easing);
    easingRef.current = easing;
    // 渲染期同步复位：token 变了这一帧就从 0 起算，不等 effect、无旧值闪烁
    if (tokRef.current !== token) {
        tokRef.current = token;
        if (pRef.current !== 0) {
            pRef.current = 0;
            setP(0);
        }
    }
    react_1.default.useEffect(() => {
        // 动画关闭或零时长：直接落终态 1，不逐帧补间
        if (!enabled || duration <= 0) {
            setP(1);
            return;
        }
        let start = null;
        const stop = (0, ticker_1.subscribe)((now) => {
            if (start == null)
                start = now;
            const t = Math.min(1, (now - start) / duration);
            if (t >= 1) {
                setP(1);
                stop();
            }
            else {
                setP(easingRef.current(t));
            }
        });
        return stop;
    }, [token, duration, enabled]);
    return enabled ? p : 1;
}
/** 返回 { mounted, style }：调用方自行决定 mounted 期间渲染什么（style 含进出场插值结果）。 */
function useTransition(visible, options = {}) {
    const { enter, exit } = options;
    const enabled = (0, ConfigContext_1.useAnimationEnabled)();
    const enterPreset = resolve(enter, presets_1.presets.slideUp);
    const exitPreset = resolve(exit, presets_1.presets.fade);
    const [mounted, setMounted] = react_1.default.useState(visible);
    // 渲染期代际：可见性每翻一次必新号（同帧可见，无 effect 滞后），保证 token 变、动画重播
    const visRef = react_1.default.useRef(visible);
    const genRef = react_1.default.useRef(0);
    if (visRef.current !== visible) {
        visRef.current = visible;
        genRef.current += 1;
    }
    react_1.default.useEffect(() => {
        if (visible) {
            setMounted(true);
            return;
        }
        if (!mounted)
            return;
        // 动画关闭：不等退场预设时长，立即卸载（无退场过渡）
        if (!enabled) {
            setMounted(false);
            return;
        }
        const timer = setTimeout(() => setMounted(false), exitPreset.duration);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, enabled]);
    const phase = visible ? 'in' : 'out';
    const preset = visible ? enterPreset : exitPreset;
    // token 编入 mounted：初始隐藏→首次显示时 effect 翻 mounted 也要触发重播（仅 phase/gen 在该帧不变）
    const progress = useReplayable(`${phase}:${genRef.current}:${mounted}`, preset.duration, preset.easing);
    return { mounted, style: (0, presets_1.styleAt)(preset, visible ? progress : 1 - progress) };
}
/** 包裹形态：visible 期间保持挂载并播进出场。 */
function Transition(props) {
    const { visible, children, style, enter, exit } = props;
    const { mounted, style: animStyle } = useTransition(visible, { enter, exit });
    if (!mounted)
        return null;
    return (react_1.default.createElement(components_1.View, { style: [animStyle, style] }, children));
}
