"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.message = void 0;
exports.useMessage = useMessage;
exports.Message = Message;
// MESSAGE：全局浮层提示。对齐 antd v5 最新的 hook 用法 —— `const [api, contextHolder] = message.useMessage()`，
// 把 `contextHolder` 就地渲染进组件树（锚点加载）：本自绘栈无 portal，contextHolder 用绝对定位铺满最近的
// relative 祖先、顶部居中堆叠多条消息，每条按 duration 自动消失。同时保留声明式 `<Message>` 单条用法（向后兼容）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
const useAnimation_1 = require("../../anim/useAnimation");
const ICON_BY_TYPE = {
    success: 'checkCircle',
    error: 'closeCircle',
    info: 'infoCircle',
    warning: 'exclamationCircle',
    loading: 'loading',
};
/** 内部：类型 → 图标主色 */
function colorOf(token, type) {
    return type === 'success'
        ? token.colorSuccess
        : type === 'error'
            ? token.colorError
            : type === 'warning'
                ? token.colorWarning
                : type === 'loading'
                    ? token.colorPrimary
                    : token.colorInfo;
}
/** 内部：单条气泡（图标 + 内容），loading 类型图标随 useAnimation 旋转 */
function MessageBubble(props) {
    const { token } = (0, theme_1.useToken)();
    const { content, type = 'info', icon, style } = props.config;
    const spin = (0, useAnimation_1.useAnimation)({ duration: 900, loop: true, playing: type === 'loading' }) * 360;
    const color = colorOf(token, type);
    return (react_1.default.createElement(components_1.View, { style: [
            {
                flexDirection: 'row',
                alignItems: 'center',
                gap: token.marginXS,
                paddingHorizontal: token.padding,
                paddingVertical: token.paddingXS,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: token.colorBorderSecondary,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgElevated,
            },
            style,
        ] },
        icon != null ? (react_1.default.createElement(components_1.View, { style: { flexShrink: 0 } }, icon)) : (react_1.default.createElement(icon_1.Icon, { name: ICON_BY_TYPE[type], size: token.fontSizeLG, color: color, rotate: type === 'loading' ? spin : 0, style: { flexShrink: 0 } })),
        typeof content === 'string' ? (react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { fontSize: token.fontSize, color: token.colorText, flexShrink: 0 } }, content)) : (content)));
}
/** 内部：气泡 + 入场动画 + 按 duration 自动关闭（config 变化时重置计时） */
function MessageItem(props) {
    const { config, defaultDuration, onClose } = props;
    const duration = config.duration ?? defaultDuration;
    react_1.default.useEffect(() => {
        if (duration <= 0)
            return;
        const timer = setTimeout(() => onClose(), duration);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration, config.content, config.type]);
    return (react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160 },
        react_1.default.createElement(MessageBubble, { config: config })));
}
/** contextHolder：绝对定位铺满最近 relative 祖先，顶部居中竖排堆叠当前所有消息 */
function MessageProvider(props) {
    const { token } = (0, theme_1.useToken)();
    const { list, options, onClose } = props;
    if (list.length === 0)
        return null;
    return (react_1.default.createElement(components_1.View, { style: { position: 'absolute', zIndex: 1080, left: 0, top: 0, width: '100%', alignItems: 'center', paddingTop: token.marginLG + (options.top ?? 0) } }, list.map((m) => (react_1.default.createElement(components_1.View, { key: m.key, style: { marginTop: m.key === list[0].key ? 0 : token.marginXS } },
        react_1.default.createElement(MessageItem, { config: m.config, defaultDuration: options.duration ?? 3000, onClose: () => onClose(m.key) }))))));
}
/**
 * antd v5 风格 hook：返回 [messageApi, contextHolder]。
 * 把 contextHolder 渲染进组件（锚点加载），用 messageApi.info/success/... 命令式触发提示。
 */
function useMessage(options = {}) {
    const [list, setList] = react_1.default.useState([]);
    const seed = react_1.default.useRef(0);
    const remove = react_1.default.useCallback((key) => {
        setList((prev) => prev.filter((m) => m.key !== key));
    }, []);
    const open = react_1.default.useCallback((config) => {
        const key = config.key ?? `msg-${++seed.current}`;
        setList((prev) => {
            const item = { key, config };
            const idx = prev.findIndex((m) => m.key === key);
            let next;
            if (idx >= 0) {
                next = prev.slice();
                next[idx] = item;
            }
            else {
                next = [...prev, item];
            }
            if (options.maxCount != null && options.maxCount > 0 && next.length > options.maxCount) {
                next = next.slice(next.length - options.maxCount);
            }
            return next;
        });
        return key;
    }, [options.maxCount]);
    const destroy = react_1.default.useCallback(() => {
        setList([]);
    }, []);
    const api = react_1.default.useMemo(() => {
        const typed = (type) => (content, duration, onClose) => {
            if (content != null && typeof content === 'object' && 'content' in content) {
                const cfg = content;
                return open({ ...cfg, type: cfg.type ?? type });
            }
            return open({ content: content, type, duration, onClose });
        };
        return {
            open,
            destroy,
            success: typed('success'),
            error: typed('error'),
            info: typed('info'),
            warning: typed('warning'),
            loading: typed('loading'),
        };
    }, [open, destroy]);
    const contextHolder = react_1.default.createElement(MessageProvider, { list: list, options: options, onClose: remove });
    return [api, contextHolder];
}
/** 全局 message 对象：目前提供 hook 用法（useMessage）。无 portal，故不提供静态全局方法。 */
exports.message = {
    useMessage,
};
/** 声明式单条用法（向后兼容）：open 时绝对定位铺满最近 relative 祖先，顶部居中显示一条。 */
function Message(props) {
    const { token } = (0, theme_1.useToken)();
    const { open, type = 'info', content, icon, duration = 3000, onClose, style } = props;
    if (!open)
        return null;
    return (react_1.default.createElement(components_1.View, { style: { position: 'absolute', zIndex: 1080, left: 0, top: 0, width: '100%', alignItems: 'center', paddingTop: token.marginLG } },
        react_1.default.createElement(MessageItem, { config: { type, content, icon, duration, style }, defaultDuration: duration, onClose: onClose ?? (() => undefined) })));
}
exports.default = exports.message;
