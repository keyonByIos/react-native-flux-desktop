"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePreview = ImagePreview;
// IMAGE.PREVIEW：图片全屏预览浮层。zIndex=1090 凌驾 Modal(1000)。
// 支持多图切换、缩放（按钮 / 1D scale 因子）、复位、遮罩点击关闭。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3];
function ImagePreview(props) {
    const { token } = (0, theme_1.useToken)();
    const { visible, images = [], current: ctrlCurrent, onCurrentChange, onClose, style } = props;
    const [innerCurrent, setInnerCurrent] = react_1.default.useState(0);
    const current = ctrlCurrent !== undefined ? ctrlCurrent : innerCurrent;
    const [scaleIdx, setScaleIdx] = react_1.default.useState(2); // 默认 1x（ZOOM_STEPS[2]=1）
    react_1.default.useEffect(() => {
        if (visible) {
            setScaleIdx(2);
            setInnerCurrent(ctrlCurrent ?? 0);
        }
    }, [visible, ctrlCurrent]);
    if (!visible || images.length === 0)
        return null;
    const img = images[Math.min(current, images.length - 1)];
    if (!img || !img.src)
        return null;
    const scale = ZOOM_STEPS[scaleIdx];
    const multi = images.length > 1;
    const goTo = (idx) => {
        const next = Math.max(0, Math.min(idx, images.length - 1));
        if (ctrlCurrent === undefined)
            setInnerCurrent(next);
        onCurrentChange && onCurrentChange(next);
        setScaleIdx(2);
    };
    const zoomIn = () => setScaleIdx((i) => Math.min(i + 1, ZOOM_STEPS.length - 1));
    const zoomOut = () => setScaleIdx((i) => Math.max(i - 1, 0));
    return (react_1.default.createElement(FadeIn_1.FadeIn, { duration: 200, style: {
            position: 'absolute',
            zIndex: 1090,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.72)',
        } },
        react_1.default.createElement(components_1.Pressable, { onPress: () => onClose && onClose(), style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 } }),
        react_1.default.createElement(components_1.Pressable, { onPress: () => onClose && onClose(), style: { position: 'absolute', top: token.padding, right: token.padding, padding: token.paddingXS, zIndex: 1091 } },
            react_1.default.createElement(icon_1.Icon, { name: "close", size: 24, color: "#ffffff" })),
        react_1.default.createElement(components_1.View, { style: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', maxWidth: '80%', maxHeight: '70%' } },
            react_1.default.createElement(components_1.Image, { source: img.src, resizeMode: "contain", style: {
                    width: 600 * scale,
                    height: 400 * scale,
                } })),
        multi ? (react_1.default.createElement(components_1.Text, { style: { position: 'absolute', top: token.padding, left: token.padding, fontSize: token.fontSize, color: 'rgba(255,255,255,0.85)' } },
            current + 1,
            " / ",
            images.length)) : null,
        react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                bottom: token.paddingLG,
                flexDirection: 'row',
                alignItems: 'center',
                gap: token.marginXS,
                paddingHorizontal: token.paddingSM,
                paddingVertical: token.paddingXXS,
                borderRadius: token.borderRadiusLG,
                backgroundColor: 'rgba(0,0,0,0.5)',
            } },
            react_1.default.createElement(components_1.Pressable, { onPress: zoomOut, style: { padding: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "minus", size: 18, color: scaleIdx <= 0 ? 'rgba(255,255,255,0.3)' : '#ffffff' })),
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: 'rgba(255,255,255,0.85)', minWidth: 40, textAlign: 'center' } },
                Math.round(scale * 100),
                "%"),
            react_1.default.createElement(components_1.Pressable, { onPress: zoomIn, style: { padding: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "plus", size: 18, color: scaleIdx >= ZOOM_STEPS.length - 1 ? 'rgba(255,255,255,0.3)' : '#ffffff' })),
            react_1.default.createElement(components_1.View, { style: { width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: token.marginXS } }),
            react_1.default.createElement(components_1.Pressable, { onPress: () => goTo(current - 1), style: { padding: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "left", size: 18, color: current <= 0 ? 'rgba(255,255,255,0.3)' : '#ffffff' })),
            react_1.default.createElement(components_1.Pressable, { onPress: () => goTo(current + 1), style: { padding: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "right", size: 18, color: current >= images.length - 1 ? 'rgba(255,255,255,0.3)' : '#ffffff' }))),
        img.alt ? (react_1.default.createElement(components_1.Text, { style: { position: 'absolute', bottom: token.paddingLG + 40, fontSize: token.fontSizeSM, color: 'rgba(255,255,255,0.7)' } }, img.alt)) : null));
}
exports.default = ImagePreview;
