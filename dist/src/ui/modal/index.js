"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modal = void 0;
exports.Modal = Modal;
exports.useModal = useModal;
// MODAL：居中对话框 + 半透明遮罩。无 portal，遮罩用绝对定位铺满最近的 relative 祖先，
// 靠 style.zIndex=1000 提升到顶层绘制（painter 两趟：主树后重画浮层），不再依赖文档顺序。
// 两种用法：1) 声明式 <Modal open ...>（对话框）；2) antd v5 hook 式 useModal() → [api, contextHolder]，
//    命令式 api.confirm/info/success/error/warning(config) 弹确认框（本自绘栈无 portal，contextHolder 就地渲染进 relative 容器）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const button_1 = require("../button");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
function Modal(props) {
    const { token } = (0, theme_1.useToken)();
    const { open, title, children, footer = true, okText = '确定', cancelText = '取消', okType = 'primary', okDanger, confirmLoading, onOk, onCancel, maskClosable = true, mask = true, closable = true, width = token.controlHeightLG * 10, style, } = props;
    if (!open)
        return null;
    return (react_1.default.createElement(FadeIn_1.FadeIn, { duration: 200, style: {
            position: 'absolute',
            zIndex: 1000,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: mask ? token.colorBgMask : 'transparent',
        } },
        mask ? (react_1.default.createElement(components_1.Pressable, { onPress: () => (maskClosable ? onCancel && onCancel() : undefined), style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 } })) : null,
        react_1.default.createElement(components_1.View, { style: [
                {
                    width,
                    backgroundColor: token.colorBgElevated,
                    borderRadius: token.borderRadiusLG,
                    padding: token.paddingLG,
                },
                style,
            ] },
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', marginBottom: token.margin } },
                react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }, numberOfLines: 1 }, title),
                closable ? (react_1.default.createElement(components_1.Pressable, { onPress: () => onCancel && onCancel(), style: { paddingHorizontal: token.paddingXXS } },
                    react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSizeLG, color: token.colorTextTertiary }))) : null),
            react_1.default.createElement(components_1.View, { style: { marginBottom: footer ? token.marginLG : 0 } }, typeof children === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } }, children)) : (children)),
            footer === false ? null : footer === true ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'flex-end', gap: token.marginXS } },
                react_1.default.createElement(button_1.Button, { type: "default", onPress: () => onCancel && onCancel() }, cancelText),
                react_1.default.createElement(button_1.Button, { type: okType, danger: okDanger, loading: confirmLoading, onPress: () => onOk && onOk() }, okText))) : (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'flex-end', gap: token.marginXS } }, footer)))));
}
const MODAL_ICON_BY_TYPE = {
    confirm: 'exclamationCircle',
    info: 'infoCircle',
    success: 'checkCircle',
    error: 'closeCircle',
    warning: 'exclamationCircle',
};
function modalAccent(token, type) {
    return type === 'success'
        ? token.colorSuccess
        : type === 'error'
            ? token.colorError
            : type === 'warning' || type === 'confirm'
                ? token.colorWarning
                : token.colorInfo;
}
/** 内部：单条确认框（图标 + 标题 + 内容 + 底部按钮），onClose 由父级在动作后调用 */
function ConfirmDialog(props) {
    const { token } = (0, theme_1.useToken)();
    const { config, onClose } = props;
    const { title, content, type = 'confirm', icon, okText = '确定', cancelText = '取消', okType = 'primary', okDanger, onOk, onCancel, closable = false, maskClosable = true, width = token.controlHeightLG * 8, footer, style, } = config;
    const showCancel = type === 'confirm';
    const doOk = () => {
        onOk?.();
        onClose();
    };
    const doCancel = () => {
        onCancel?.();
        onClose();
    };
    return (react_1.default.createElement(FadeIn_1.FadeIn, { duration: 200, style: {
            position: 'absolute',
            zIndex: 1000,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: token.colorBgMask,
        } },
        maskClosable ? (react_1.default.createElement(components_1.Pressable, { onPress: doCancel, style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 } })) : null,
        react_1.default.createElement(components_1.View, { style: [
                {
                    width,
                    backgroundColor: token.colorBgElevated,
                    borderRadius: token.borderRadiusLG,
                    padding: token.paddingLG,
                },
                style,
            ] },
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'flex-start', gap: token.marginSM } },
                icon != null ? (react_1.default.createElement(components_1.View, { style: { flexShrink: 0 } }, icon)) : (react_1.default.createElement(icon_1.Icon, { name: MODAL_ICON_BY_TYPE[type], size: token.fontSizeLG + 4, color: modalAccent(token, type), style: { flexShrink: 0 } })),
                react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText } }, title),
                closable ? (react_1.default.createElement(components_1.Pressable, { onPress: doCancel, style: { paddingHorizontal: token.paddingXXS } },
                    react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSizeLG, color: token.colorTextTertiary }))) : null),
            content != null ? (react_1.default.createElement(components_1.View, { style: { marginLeft: token.controlHeightLG + token.marginSM, marginTop: token.marginXS } }, typeof content === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } }, content)) : (content))) : null,
            footer === false ? null : footer != null && footer !== true ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'flex-end', gap: token.marginXS, marginTop: token.marginLG } }, footer)) : (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'flex-end', gap: token.marginXS, marginTop: token.marginLG } },
                showCancel ? (react_1.default.createElement(button_1.Button, { type: "default", onPress: doCancel }, cancelText)) : null,
                react_1.default.createElement(button_1.Button, { type: okType, danger: okDanger, onPress: doOk }, okText))))));
}
/** contextHolder：按打开顺序堆叠当前所有确认框（后开的在上层） */
function ModalProvider(props) {
    const { list, onClose } = props;
    if (list.length === 0)
        return null;
    return (react_1.default.createElement(react_1.default.Fragment, null, list.map((m) => (react_1.default.createElement(ConfirmDialog, { key: m.key, config: m.config, onClose: () => onClose(m.key) })))));
}
/**
 * antd v5 风格 hook：返回 [modalApi, contextHolder]。
 * 把 contextHolder 渲染进组件（锚点加载），用 modalApi.confirm/info/success/error/warning(config) 命令式弹窗。
 */
function useModal() {
    const [list, setList] = react_1.default.useState([]);
    const seed = react_1.default.useRef(0);
    const remove = react_1.default.useCallback((key) => {
        setList((prev) => prev.filter((m) => m.key !== key));
    }, []);
    const open = react_1.default.useCallback((config) => {
        const key = config.key ?? `mdl-${++seed.current}`;
        setList((prev) => {
            const item = { key, config };
            const idx = prev.findIndex((m) => m.key === key);
            if (idx >= 0) {
                const next = prev.slice();
                next[idx] = item;
                return next;
            }
            return [...prev, item];
        });
        return key;
    }, []);
    const destroy = react_1.default.useCallback((key) => {
        if (key === undefined)
            setList([]);
        else
            setList((prev) => prev.filter((m) => m.key !== key));
    }, []);
    const api = react_1.default.useMemo(() => {
        const typed = (type) => (config) => open({ ...config, type: config.type ?? type });
        return {
            open,
            destroy,
            confirm: typed('confirm'),
            info: typed('info'),
            success: typed('success'),
            error: typed('error'),
            warning: typed('warning'),
        };
    }, [open, destroy]);
    const contextHolder = react_1.default.createElement(ModalProvider, { list: list, onClose: remove });
    return [api, contextHolder];
}
/** 全局 modal 对象：目前提供 hook 用法（useModal）。无 portal，故不提供静态全局方法。 */
exports.modal = {
    useModal,
};
exports.default = Modal;
