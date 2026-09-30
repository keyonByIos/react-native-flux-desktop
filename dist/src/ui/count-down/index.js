"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountDown = CountDown;
// COUNTDOWN：倒计时。对应 antd Statistic.Countdown。定时器驱动（复用全局 ticker），
// 自包含、无外部依赖。value 为截止时刻时间戳(ms)，或用 leftTime 传剩余毫秒。
// format 支持 D/HH/mm/ss/SSS token；到达 0 触发 onFinish。仅在展示文本变化时重绘，省 CPU。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const ticker_1 = require("../../anim/ticker");
function pad(n, len = 2) {
    return String(Math.floor(n)).padStart(len, '0');
}
function splitTime(ms) {
    const c = Math.max(0, ms);
    return {
        days: Math.floor(c / 86400000),
        hours: Math.floor(c / 3600000) % 24,
        minutes: Math.floor(c / 60000) % 60,
        seconds: Math.floor(c / 1000) % 60,
        milliseconds: c % 1000,
    };
}
function formatTime(ms, format) {
    const t = splitTime(ms);
    return format
        .replace(/HH/g, pad(t.hours))
        .replace(/mm/g, pad(t.minutes))
        .replace(/ss/g, pad(t.seconds))
        .replace(/SSS/g, pad(t.milliseconds, 3))
        .replace(/DD/g, pad(t.days))
        .replace(/D/g, String(t.days));
}
function CountDown(props) {
    const { token } = (0, theme_1.useToken)();
    const { title, value, leftTime, format = 'HH:mm:ss', paused, prefix, suffix, onChange, onFinish, render, valueStyle, style } = props;
    // 挂载时刻：leftTime 模式以此为基准换算绝对截止点
    const startRef = react_1.default.useRef(Date.now());
    const target = value !== undefined ? value : leftTime !== undefined ? startRef.current + leftTime : startRef.current;
    const [, force] = react_1.default.useState(0);
    const lastText = react_1.default.useRef('');
    const finished = react_1.default.useRef(false);
    react_1.default.useEffect(() => {
        finished.current = false;
        if (paused)
            return;
        const stop = (0, ticker_1.subscribe)(() => {
            const remaining = Math.max(0, target - Date.now());
            const text = formatTime(remaining, format);
            if (text !== lastText.current) {
                lastText.current = text;
                onChange && onChange(splitTime(remaining));
                force((n) => n + 1);
            }
            if (remaining <= 0 && !finished.current) {
                finished.current = true;
                onFinish && onFinish();
            }
        });
        return stop;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, format, paused]);
    const remaining = Math.max(0, target - Date.now());
    const text = formatTime(remaining, format);
    return (react_1.default.createElement(components_1.View, { style: style },
        title != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextTertiary, marginBottom: token.marginXXS } }, title)) : null,
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'baseline' } },
            prefix != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText, marginRight: token.marginXXS } }, prefix)) : null,
            render ? (render(splitTime(remaining))) : (react_1.default.createElement(components_1.Text, { style: [{ fontSize: token.fontSizeXL, fontWeight: '500', color: token.colorText }, valueStyle] }, text)),
            suffix != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextTertiary, marginLeft: token.marginXXS } }, suffix)) : null)));
}
exports.default = CountDown;
