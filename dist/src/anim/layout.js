"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFlip = useFlip;
exports.Flip = Flip;
// FLIP 布局动画：First-Last-Invert-Play。元素因状态变化被 Yoga 挪位/改尺寸后，
// 用自身 onLayoutAbs 报来的「新盒」与上一帧「旧盒」求差，施加一个反向 transform 把它视觉拉回旧位置，
// 再逐帧补间回恒等 —— 于是布局跳变看起来是平滑滑动/伸缩，而非瞬移。
//
// 关键前提（与 transform 动画一致的取舍）：transform 是纯绘制期效果、绝不进 Yoga，
// 所以改 transform 不会触发重排 → onLayoutAbs 不会因我们自己的动画而重新报新值 → 无反馈循环。
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
const components_1 = require("../components");
const ticker_1 = require("./ticker");
const ConfigContext_1 = require("../theme/ConfigContext");
const easing_1 = require("./easing");
/**
 * 测量宿主盒绝对位置，检测跳变并产出「反演→恒等」的补间 transform。
 * 用法：把 onLayoutAbs 挂到元素上、transform + transformOrigin:'0 0' 塞进 style。
 */
function useFlip(options = {}) {
    const duration = options.duration ?? 320;
    const enabled = (0, ConfigContext_1.useAnimationEnabled)();
    const easeRef = (0, react_2.useRef)(options.easing ?? easing_1.easeOutCubic);
    easeRef.current = options.easing ?? easing_1.easeOutCubic;
    const prev = (0, react_2.useRef)(null);
    const [transform, setTransform] = (0, react_2.useState)([]);
    const stopRef = (0, react_2.useRef)(() => { });
    const onLayoutAbs = (e) => {
        const cur = e.nativeEvent.layout;
        const p = prev.current;
        prev.current = cur;
        if (!p)
            return; // 首次测量：只记录，不动画
        // 动画关闭：只跟随新盒，不施加反演 transform → 布局跳变即时到位
        if (!enabled) {
            stopRef.current();
            setTransform([]);
            return;
        }
        const dx = p.x - cur.x;
        const dy = p.y - cur.y;
        const sx = cur.w > 0 ? p.w / cur.w : 1;
        const sy = cur.h > 0 ? p.h / cur.h : 1;
        // 位移与缩放都近乎不变 → 视为静止（也挡住了「每帧同值回调」导致的误重启）
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) {
            return;
        }
        stopRef.current();
        let start = null;
        stopRef.current = (0, ticker_1.subscribe)((now) => {
            if (start == null)
                start = now;
            const t = duration <= 0 ? 1 : (now - start) / duration;
            if (t >= 1) {
                setTransform([]);
                stopRef.current();
                return;
            }
            // k：1→0，反演量随进度衰减到恒等
            const k = 1 - easeRef.current(t);
            const tf = [];
            if (Math.abs(dx * k) > 0.1 || Math.abs(dy * k) > 0.1) {
                tf.push({ translateX: dx * k }, { translateY: dy * k });
            }
            if (Math.abs(sx - 1) > 0.01 || Math.abs(sy - 1) > 0.01) {
                tf.push({ scaleX: 1 + (sx - 1) * k }, { scaleY: 1 + (sy - 1) * k });
            }
            setTransform(tf);
        });
    };
    (0, react_2.useEffect)(() => () => stopRef.current(), []);
    return { onLayoutAbs, transform };
}
/**
 * 声明式 FLIP 容器：包一层 View，自动测盒 + 反演补间。
 * transformOrigin 固定 '0 0'（左上角），使缩放把「旧盒」精确套到「新盒」上（左对齐、按比例）；
 * 纯位移场景（尺寸不变）缩放分量恒为 1，不会拉伸子内容。
 */
function Flip(props) {
    const { children, style, duration, easing } = props;
    const { onLayoutAbs, transform } = useFlip({ duration, easing });
    return (react_1.default.createElement(components_1.View, { style: [{ transform, transformOrigin: '0 0' }, style], onLayoutAbs: onLayoutAbs }, children));
}
