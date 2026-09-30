"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenuLayer = ContextMenuLayer;
// CONTEXT-MENU：全局右键上下文菜单浮层（无 portal 范式，对齐 Message/Modal）。
// 订阅 src/window/contextmenu store；被右键的字段（Input）在 showContextMenu 里写入菜单项。
// 须挂在 Window 根（FluxProvider 只透传 context 不产 host 节点，故本组件是 intrinsic 'window' 的直接子节点），
// 用 position:absolute + 窗口逻辑坐标 left/top 定位，zIndex=1070（Popover 层），确保不被 overflow:hidden 字段裁剪。
// 视觉对齐 antd v5 Dropdown 菜单：投影 + 内衬 padding + 圆角 hover 块（左右留边）+ 右侧快捷键提示 + 分组分隔线。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const contextmenu_1 = require("../../window/contextmenu");
function ContextMenuLayer() {
    const { token } = (0, theme_1.useToken)();
    const state = react_1.default.useSyncExternalStore(contextmenu_1.subscribeContextMenu, contextmenu_1.getContextMenuState);
    const [over, setOver] = react_1.default.useState(-1);
    // 每次重新弹出菜单复位 hover
    react_1.default.useEffect(() => {
        setOver(-1);
    }, [state.x, state.y, state.visible]);
    if (!state.visible || state.items.length === 0)
        return null;
    const itemH = token.controlHeightSM + 8; // 28+：中文项不再局促
    const hoverR = token.borderRadiusSM ?? token.borderRadius;
    return (react_1.default.createElement(components_1.View, { style: {
            position: 'absolute',
            zIndex: 1070,
            left: state.x,
            top: state.y,
            minWidth: 176,
            paddingVertical: token.marginXXS,
            paddingHorizontal: token.marginXXS,
            borderWidth: token.lineWidth,
            borderStyle: 'solid',
            borderColor: token.colorBorderSecondary,
            borderRadius: token.borderRadiusLG,
            backgroundColor: token.colorBgElevated,
            shadowColor: 'rgba(0,0,0,0.22)',
            shadowOpacity: 1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
        } }, state.items.map((it, i) => (react_1.default.createElement(react_1.default.Fragment, { key: i },
        it.divider ? react_1.default.createElement(components_1.View, { style: { height: token.lineWidth, marginVertical: token.marginXXS, marginHorizontal: token.marginXS, backgroundColor: token.colorSplit } }) : null,
        react_1.default.createElement(components_1.Pressable, { onPressIn: () => {
                if (it.disabled)
                    return;
                it.onClick();
                (0, contextmenu_1.hideContextMenu)();
            }, onMouseEnter: () => !it.disabled && setOver(i), onMouseLeave: () => setOver((o) => (o === i ? -1 : o)) },
            react_1.default.createElement(components_1.View, { style: {
                    height: itemH,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: token.paddingSM,
                    borderRadius: hoverR,
                    backgroundColor: !it.disabled && over === i ? token.controlItemBgHover : 'transparent',
                    cursor: it.disabled ? 'not-allowed' : 'pointer',
                } },
                react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { fontSize: token.fontSize, color: it.disabled ? token.colorTextQuaternary : token.colorText } }, it.label))))))));
}
exports.default = ContextMenuLayer;
