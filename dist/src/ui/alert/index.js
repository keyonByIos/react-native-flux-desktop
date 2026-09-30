"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = Alert;
// Alert：参考 antd。type 决定语义配色，showIcon / description / closable。
// 颜色全部取自 token，随主题换皮。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const ticker_1 = require("../../anim/ticker");
const textLayout_1 = require("../../paint/textLayout");
function Alert(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Alert');
    const { type = 'info', message, description, showIcon, icon, closable, closeText, banner, action, marquee, marqueeSpeed, onClose, style } = props;
    const [visible, setVisible] = react_1.default.useState(true);
    const [mounted, setMounted] = react_1.default.useState(true);
    // 关闭淡出：visible 驱动 opacity 1→0，动画走完再卸载（hook 必须在早返回之前调用，保证顺序稳定）
    const fade = (0, useTween_1.useTween)(visible ? 1 : 0, 200, easing_1.easeOutCubic);
    if (!mounted)
        return null;
    const theme = (() => {
        switch (type) {
            case 'success':
                return { bg: token.colorSuccessBg, border: token.colorSuccessBorder, fg: token.colorSuccessText, icon: 'checkCircle' };
            case 'warning':
                return { bg: token.colorWarningBg, border: token.colorWarningBorder, fg: token.colorWarningText, icon: 'warning' };
            case 'error':
                return { bg: token.colorErrorBg, border: token.colorErrorBorder, fg: token.colorErrorText, icon: 'closeCircle' };
            default:
                return { bg: token.colorInfoBg, border: token.colorBorderSecondary, fg: token.colorInfoText, icon: 'infoCircle' };
        }
    })();
    const hasDesc = description != null;
    const shell = {
        flexDirection: 'row',
        alignItems: hasDesc ? 'flex-start' : 'center',
        paddingVertical: hasDesc ? ct.withDescriptionPaddingBlock : ct.paddingBlock,
        paddingHorizontal: hasDesc ? ct.withDescriptionPaddingInline : ct.paddingInline,
        borderRadius: banner ? 0 : ct.borderRadius,
        borderWidth: banner ? 0 : token.lineWidth,
        borderStyle: 'solid',
        borderColor: theme.border,
        backgroundColor: theme.bg,
    };
    return (react_1.default.createElement(components_1.View, { style: [shell, style, { opacity: fade }] },
        showIcon ? (react_1.default.createElement(components_1.View, { style: { marginRight: token.marginSM, marginTop: hasDesc ? token.marginXXS : 0 } }, icon != null ? icon : react_1.default.createElement(icon_1.Icon, { name: theme.icon, size: token.fontSize, color: token.colorText }))) : null,
        react_1.default.createElement(components_1.View, { style: { flex: 1 } },
            message != null ? (marquee && (typeof message === 'string' || typeof message === 'number') ? (react_1.default.createElement(MarqueeText, { text: String(message), fontSize: token.fontSize, fontWeight: "500", color: token.colorText, speed: marqueeSpeed ?? 50 })) : (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, fontWeight: '500', color: token.colorText } }, message))) : null,
            hasDesc ? (react_1.default.createElement(components_1.Text, { style: {
                    fontSize: token.fontSizeSM,
                    lineHeight: token.fontSizeSM * 1.6,
                    color: token.colorTextSecondary,
                    marginTop: message != null ? token.marginXXS : 0,
                } }, description)) : null),
        action != null ? react_1.default.createElement(components_1.View, { style: { marginLeft: token.marginSM, alignSelf: 'center' } }, action) : null,
        closable ? (react_1.default.createElement(components_1.Pressable, { style: { marginLeft: token.marginSM, alignSelf: 'center', padding: token.marginXXS }, onPress: () => {
                setVisible(false);
                setTimeout(() => setMounted(false), 220);
                onClose && onClose();
            } }, closeText != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: theme.fg } }, closeText)) : (react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSizeSM, color: token.colorTextTertiary, strokeWidth: 2.5 })))) : null));
}
exports.default = Alert;
// MarqueeText：单行文本横向滚动。自然宽超出可视宽时逐帧左移，完全滚出后从右沿带一个视口间隙重新进入；
// 未超宽（或视口未就绪）则静止于左。逐帧用全局 ticker 驱动 offset，overflow 裁剪，状态局部化避免整卡重绘。
function MarqueeText(props) {
    const { text, fontSize, fontWeight, color, speed } = props;
    const animationEnabled = (0, theme_1.useAnimationEnabled)();
    const vpRef = react_1.default.useRef(null);
    const offsetRef = react_1.default.useRef(0);
    const [offset, setOffset] = react_1.default.useState(0);
    const tw = react_1.default.useMemo(() => (0, textLayout_1.measureSingleLineWidth)(text, { fontSize, fontWeight }), [text, fontSize, fontWeight]);
    react_1.default.useEffect(() => {
        // 动画关闭：不逐帧滚动，文本静止于左（overflow 裁剪，不循环）
        if (!animationEnabled) {
            if (offsetRef.current !== 0) {
                offsetRef.current = 0;
                setOffset(0);
            }
            return;
        }
        let last = null;
        const stop = (0, ticker_1.subscribe)((now) => {
            const vp = vpRef.current ? vpRef.current.w : 0;
            if (vp <= 0 || tw <= vp + 1) {
                last = null;
                if (offsetRef.current !== 0) {
                    offsetRef.current = 0;
                    setOffset(0);
                }
                return;
            }
            if (last == null)
                last = now;
            const dt = now - last;
            last = now;
            let no = offsetRef.current - (speed * dt) / 1000;
            if (no < -tw)
                no = vp; // 完全滚出后从右沿重新进入
            offsetRef.current = no;
            setOffset(no);
        });
        return () => stop();
    }, [tw, speed, animationEnabled]);
    return react_1.default.createElement('view', { ref: vpRef, style: { overflow: 'hidden', width: '100%' } }, react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { fontSize, fontWeight, color, flexShrink: 0, width: tw, marginLeft: offset } }, text));
}
