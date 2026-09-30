"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = void 0;
exports.BadgeBase = BadgeBase;
exports.Ribbon = Ribbon;
exports.Status = Status;
// Badge：角标用 position:'absolute' + right/top 锚定，正好验证自绘管线的绝对定位链路。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const useAnimation_1 = require("../../anim/useAnimation");
function BadgeBase(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Badge');
    const { count, dot, color = 'error', showZero, overflowCount = 99, offset = [0, 0], children, style } = props;
    const bg = color === 'error'
        ? token.colorError
        : color === 'processing'
            ? token.colorPrimary
            : color === 'success'
                ? token.colorSuccess
                : color === 'warning'
                    ? token.colorWarning
                    : color === 'default'
                        ? token.colorFill
                        : color;
    const hidden = !dot && (count === undefined || count === null || (Number(count) === 0 && !showZero));
    // dot 只有几个像素，外圈再压 1px 会把它吞掉，所以尺寸加上环宽
    const h = (dot ? ct.dotSize : ct.indicatorHeight) + (dot ? token.lineWidth * 2 : 0);
    const shownText = typeof count === 'number' && count > overflowCount ? `${overflowCount}+` : count;
    const standalone = children == null;
    const indicator = hidden ? null : (react_1.default.createElement(components_1.View, { style: {
            position: standalone ? 'relative' : 'absolute',
            top: standalone ? undefined : 0,
            right: standalone ? undefined : 0,
            // 角标压在宿主右上角外侧：半个高度往外
            marginTop: standalone ? 0 : -h / 2 + offset[1],
            marginRight: standalone ? 0 : -h / 2 + offset[0],
            height: h,
            minWidth: dot ? h : ct.indicatorHeight,
            paddingHorizontal: dot ? 0 : token.paddingXS,
            borderRadius: h / 2,
            backgroundColor: bg,
            borderWidth: token.lineWidth,
            borderColor: standalone ? 'transparent' : token.colorBgElevated,
            alignItems: 'center',
            justifyContent: 'center',
        } }, !dot && count != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: ct.textFontSize, color: token.colorTextLightSolid, lineHeight: h - token.lineWidth * 2 } }, shownText)) : null));
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative', alignSelf: 'flex-start' }, style] },
        children != null ? react_1.default.createElement(components_1.View, null, children) : null,
        indicator));
}
function Ribbon(props) {
    const { token } = (0, theme_1.useToken)();
    const { text, icon, color = 'primary', placement = 'end', children, style } = props;
    const bg = color === 'primary'
        ? token.colorPrimary
        : color === 'success'
            ? token.colorSuccess
            : color === 'warning'
                ? token.colorWarning
                : color === 'error'
                    ? token.colorError
                    : color === 'default'
                        ? token.colorFill
                        : color;
    const h = token.controlHeightSM - token.paddingXXS;
    const show = icon != null || text != null;
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style] },
        children,
        show ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                top: 0,
                left: placement === 'start' ? 0 : undefined,
                right: placement === 'end' ? 0 : undefined,
                height: h,
                paddingHorizontal: token.paddingXS,
                borderTopLeftRadius: placement === 'start' ? token.borderRadiusLG : 0,
                borderBottomRightRadius: placement === 'start' ? token.borderRadiusLG : 0,
                borderTopRightRadius: placement === 'end' ? token.borderRadiusLG : 0,
                borderBottomLeftRadius: placement === 'end' ? token.borderRadiusLG : 0,
                backgroundColor: bg,
                alignItems: 'center',
                justifyContent: 'center',
            } }, icon != null ? icon : react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorBgContainer } }, text))) : null));
}
function Status(props) {
    const { token } = (0, theme_1.useToken)();
    const { status = 'default', text, style } = props;
    const dot = token.fontSizeSM;
    const color = status === 'error'
        ? token.colorError
        : status === 'success'
            ? token.colorSuccess
            : status === 'warning'
                ? token.colorWarning
                : status === 'processing'
                    ? token.colorPrimary
                    : token.colorTextQuaternary;
    // processing：外圈光晕 0→1 循环放大渐隐
    const t = (0, useAnimation_1.useAnimation)({ duration: 1500, loop: true, playing: status === 'processing' });
    const halo = dot + t * dot * 1.6;
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }, style] },
        react_1.default.createElement(components_1.View, { style: { width: dot, height: dot, borderRadius: dot / 2, position: 'relative', alignItems: 'center', justifyContent: 'center' } },
            status === 'processing' ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', width: halo, height: halo, borderRadius: halo / 2, backgroundColor: color, opacity: (1 - t) * 0.4 } })) : null,
            react_1.default.createElement(components_1.View, { style: { width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color } })),
        text != null ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } }, text) : null));
}
/** Badge + Badge.Ribbon + Badge.Status 复合导出 */
exports.Badge = Object.assign(BadgeBase, { Ribbon, Status });
