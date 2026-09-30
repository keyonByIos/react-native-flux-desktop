"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMotionValue = useMotionValue;
exports.useSpring = useSpring;
exports.useTransformTween = useTransformTween;
// 运动值与变换补间：把「目标值」平滑到最新，供交互（hover/press）与状态迁移驱动 transform。
// 与 useTween 的区别：这里额外支持物理弹簧（帧率无关、target 突变时保留速度，天然适合交互跟随），
// 并把四个变换分量打包成可直接塞进 style.transform 的数组。
const react_1 = require("react");
const ticker_1 = require("./ticker");
const ConfigContext_1 = require("../theme/ConfigContext");
const easing_1 = require("./easing");
/**
 * 单一订阅循环内按 mode 分支：tween 走定时缓动，spring 走半隐式欧拉积分（子步保稳）。
 * 只在 hook 顶层调用一次 subscribe，规避「条件调用 hook」。静止即退订，不空转。
 */
function useMotionValue(target, options = {}) {
    const { mode = 'tween', duration = 220, easing = easing_1.easeOutCubic, stiffness = 170, damping = 20, mass = 1, } = options;
    const enabled = (0, ConfigContext_1.useAnimationEnabled)();
    const [value, setValue] = (0, react_1.useState)(target);
    const posRef = (0, react_1.useRef)(value);
    posRef.current = value;
    const velRef = (0, react_1.useRef)(0);
    const easeRef = (0, react_1.useRef)(easing);
    easeRef.current = easing;
    (0, react_1.useEffect)(() => {
        // 动画关闭：不补间也不弹簧，直接把位置/速度锁到 target
        if (!enabled) {
            setValue(target);
            posRef.current = target;
            velRef.current = 0;
            return;
        }
        const from = posRef.current;
        if (Math.abs(from - target) < 1e-4) {
            setValue(target);
            return;
        }
        let stop = () => { };
        if (mode === 'tween') {
            let start = null;
            stop = (0, ticker_1.subscribe)((now) => {
                if (start == null)
                    start = now;
                const t = duration <= 0 ? 1 : (now - start) / duration;
                if (t >= 1) {
                    setValue(target);
                    posRef.current = target;
                    velRef.current = 0;
                    stop();
                }
                else {
                    setValue(from + (target - from) * easeRef.current(t));
                }
            });
        }
        else {
            let last = null;
            stop = (0, ticker_1.subscribe)((now) => {
                if (last == null) {
                    last = now;
                    return;
                }
                let dt = (now - last) / 1000;
                last = now;
                if (dt > 0.064)
                    dt = 0.064; // 掉帧/切后台时钳制步长，防发散
                const steps = Math.max(1, Math.ceil(dt / 0.008));
                const h = dt / steps;
                let x = posRef.current;
                let v = velRef.current;
                for (let i = 0; i < steps; i++) {
                    const F = -stiffness * (x - target) - damping * v;
                    const a = F / mass;
                    v += a * h;
                    x += v * h;
                }
                posRef.current = x;
                velRef.current = v;
                if (Math.abs(v) < 0.01 && Math.abs(x - target) < 0.01) {
                    setValue(target);
                    posRef.current = target;
                    velRef.current = 0;
                    stop();
                }
                else {
                    setValue(x);
                }
            });
        }
        return () => stop();
        // easing 经 ref 读取不入依赖；其余为原始值，稳定
    }, [target, mode, duration, stiffness, damping, mass, enabled]);
    return enabled ? value : target;
}
/** 物理弹簧值：target 变化时从当前速度继续，适合交互/手势。config 用原始值传入避免每帧换引用重启。 */
function useSpring(target, config = {}) {
    return useMotionValue(target, { mode: 'spring', ...config });
}
/**
 * 把目标变换逐分量平滑到最新值，返回可直接用于 style.transform 的数组。
 * 分量固定调用 4 次 useMotionValue（不随 target 键增减而变），符合 hook 规则。
 * 全部落回恒等时 parseTransform 返回 null → painter 走快速路径，静止零开销。
 */
function useTransformTween(target, options = {}) {
    const tx = useMotionValue(target.translateX ?? 0, options);
    const ty = useMotionValue(target.translateY ?? 0, options);
    const sc = useMotionValue(target.scale ?? 1, options);
    const rot = useMotionValue(target.rotate ?? 0, options);
    return [
        { translateX: tx },
        { translateY: ty },
        { scale: sc },
        { rotate: `${rot}deg` },
    ];
}
