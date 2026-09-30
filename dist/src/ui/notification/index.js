"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notification = void 0;
exports.useNotification = useNotification;
exports.Notification = Notification;
// NOTIFICATION：通知卡片。对齐 antd v5 hook 用法 —— `const [api, contextHolder] = notification.useNotification()`，
// 把 contextHolder 就地渲染进组件树（本自绘栈无 portal）：绝对定位停靠到最近的 relative 祖先，按 placement
// 分四角堆叠多条卡片，每条按 duration 自动消失。同时保留声明式 `<Notification>` 单条用法（向后兼容）。
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
};
/** 内部：类型 → 图标主色 */
function accentOf(token, type) {
    return type === 'success'
        ? token.colorSuccess
        : type === 'error'
            ? token.colorError
            : type === 'warning'
                ? token.colorWarning
                : token.colorInfo;
}
/** 内部：单张卡片（图标 + 标题/描述 + 关闭），loading 型图标可旋转由调用方决定 */
function NotificationCard(props) {
    const { token } = (0, theme_1.useToken)();
    const { config, onClose } = props;
    const { title, description, type = 'info', icon, btn, closeIcon, onClick, style } = config;
    const accent = accentOf(token, type);
    return (react_1.default.createElement(components_1.Pressable, { onPress: onClick, style: [
            {
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: token.marginSM,
                maxWidth: token.controlHeightLG * 7,
                minWidth: token.controlHeightLG * 4,
                padding: token.padding,
                borderRadius: token.borderRadiusLG,
                backgroundColor: token.colorBgElevated,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: token.colorBorderSecondary,
            },
            style,
        ] },
        icon != null ? (react_1.default.createElement(components_1.View, { style: { flexShrink: 0, marginTop: token.marginXXS } }, icon)) : (react_1.default.createElement(icon_1.Icon, { name: ICON_BY_TYPE[type], size: token.fontSizeLG, color: accent, rotate: props.spin ?? 0, style: { flexShrink: 0, marginTop: token.marginXXS } })),
        react_1.default.createElement(components_1.View, { style: { flexShrink: 1 } },
            title != null ? (typeof title === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText } }, title)) : (title)) : null,
            description != null ? (typeof description === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: token.marginXXS } }, description)) : (description)) : null,
            btn != null ? react_1.default.createElement(components_1.View, { style: { marginTop: token.marginSM } }, btn) : null),
        onClose ? (react_1.default.createElement(components_1.Pressable, { onPress: onClose, style: { padding: token.marginXXS } }, closeIcon != null ? (closeIcon) : (react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSize, color: token.colorTextQuaternary, style: { flexShrink: 0 } })))) : null));
}
/** 内部：卡片 + 入场动画 + 按 duration 自动关闭（config 变化时重置计时） */
function NotificationItem(props) {
    const { config, duration, onClose } = props;
    react_1.default.useEffect(() => {
        if (duration <= 0)
            return;
        const timer = setTimeout(() => onClose(), duration);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration, config.title, config.description, config.type]);
    return (react_1.default.createElement(FadeIn_1.FadeIn, { duration: 200 },
        react_1.default.createElement(NotificationCard, { config: config, onClose: onClose })));
}
/** 内部：一个角落的停靠容器（顶部条带 / 底部条带，只占自身高度，不铺满全屏避免遮挡命中） */
function PlacementGroup(props) {
    const { token } = (0, theme_1.useToken)();
    const { placement, items, gap, offset, defaultDuration, onClose } = props;
    if (items.length === 0)
        return null;
    const isTop = placement === 'topLeft' || placement === 'topRight';
    const isRight = placement === 'topRight' || placement === 'bottomRight';
    const container = {
        position: 'absolute',
        zIndex: 1080,
        left: 0,
        right: 0,
        flexDirection: 'column',
        alignItems: isRight ? 'flex-end' : 'flex-start',
        padding: token.margin,
        paddingTop: isTop ? token.margin + offset : token.margin,
        paddingBottom: isTop ? token.margin : token.margin + offset,
    };
    if (isTop)
        container.top = 0;
    else
        container.bottom = 0;
    return (react_1.default.createElement(components_1.View, { style: container }, items.map((n, idx) => (react_1.default.createElement(components_1.View, { key: n.key, style: { marginTop: idx === 0 ? 0 : gap } },
        react_1.default.createElement(NotificationItem, { config: n.config, duration: n.config.duration ?? defaultDuration, onClose: () => onClose(n.key) }))))));
}
/** contextHolder：按 placement 分四角停靠，各自竖向堆叠当前通知 */
function NotificationProvider(props) {
    const { token } = (0, theme_1.useToken)();
    const { list, options, onClose } = props;
    if (list.length === 0)
        return null;
    const defaultPlacement = options.placement ?? 'topRight';
    const groups = {
        topRight: [],
        topLeft: [],
        bottomRight: [],
        bottomLeft: [],
    };
    for (const it of list)
        groups[it.config.placement ?? defaultPlacement].push(it);
    const placements = ['topRight', 'topLeft', 'bottomRight', 'bottomLeft'];
    return (react_1.default.createElement(react_1.default.Fragment, null, placements.map((p) => (react_1.default.createElement(PlacementGroup, { key: p, placement: p, items: groups[p], gap: token.marginXS, offset: p === 'topRight' || p === 'topLeft' ? options.top ?? 0 : options.bottom ?? 0, defaultDuration: options.duration ?? 4500, onClose: onClose })))));
}
/**
 * antd v5 风格 hook：返回 [notificationApi, contextHolder]。
 * 把 contextHolder 渲染进组件（锚点加载），用 notificationApi.open/success/... 命令式触发通知。
 * options 为全局默认（placement / duration / top / bottom / maxCount），可被单条 config 覆盖。
 */
function useNotification(options = {}) {
    const [list, setList] = react_1.default.useState([]);
    const seed = react_1.default.useRef(0);
    const remove = react_1.default.useCallback((key) => {
        setList((prev) => prev.filter((n) => n.key !== key));
    }, []);
    const open = react_1.default.useCallback((config) => {
        const key = config.key ?? `ntf-${++seed.current}`;
        setList((prev) => {
            const item = { key, config };
            const idx = prev.findIndex((n) => n.key === key);
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
    const destroy = react_1.default.useCallback((key) => {
        if (key === undefined)
            setList([]);
        else
            setList((prev) => prev.filter((n) => n.key !== key));
    }, []);
    const api = react_1.default.useMemo(() => {
        const typed = (type) => (config) => open({ ...config, type: config.type ?? type });
        return {
            open,
            destroy,
            success: typed('success'),
            error: typed('error'),
            info: typed('info'),
            warning: typed('warning'),
        };
    }, [open, destroy]);
    const contextHolder = react_1.default.createElement(NotificationProvider, { list: list, options: options, onClose: remove });
    return [api, contextHolder];
}
/** 全局 notification 对象：目前提供 hook 用法（useNotification）。无 portal，故不提供静态全局方法。 */
exports.notification = {
    useNotification,
};
/** 声明式单条用法（向后兼容）：open 时绝对定位停靠到最近 relative 祖先的对应角落。 */
function Notification(props) {
    const { token } = (0, theme_1.useToken)();
    const { open, title, description, type = 'info', placement = 'topRight', duration = 4500, onClose, icon, btn, closeIcon, onClick, style, } = props;
    const spin = (0, useAnimation_1.useAnimation)({ duration: 900, loop: true, playing: !!open && type === 'info' && icon === 'loading' }) * 360;
    react_1.default.useEffect(() => {
        if (!open || duration <= 0)
            return;
        const timer = setTimeout(() => onClose && onClose(), duration);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, duration]);
    if (!open)
        return null;
    const config = {
        title,
        description,
        type,
        placement,
        duration,
        btn,
        closeIcon,
        onClick,
        style,
        icon: icon != null ? react_1.default.createElement(icon_1.Icon, { name: icon, size: token.fontSizeLG, color: accentOf(token, type), rotate: spin }) : undefined,
    };
    const isTop = placement === 'topLeft' || placement === 'topRight';
    const isRight = placement === 'topRight' || placement === 'bottomRight';
    const overlay = {
        position: 'absolute',
        zIndex: 1080,
        left: 0,
        right: 0,
        flexDirection: 'column',
        alignItems: isRight ? 'flex-end' : 'flex-start',
        padding: token.margin,
    };
    if (isTop)
        overlay.top = 0;
    else
        overlay.bottom = 0;
    return (react_1.default.createElement(components_1.View, { style: overlay },
        react_1.default.createElement(NotificationCard, { config: config, spin: spin, onClose: onClose })));
}
exports.default = exports.notification;
