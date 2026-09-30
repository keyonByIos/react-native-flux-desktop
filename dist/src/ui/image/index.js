"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageBox = void 0;
// Image：图片展示。解码在 painter 的 imageCache 里异步完成，加载前露出占位底色；
// 支持圆角 / 尺寸 / caption / alt / fallback（空 src 占位）。preview 可点击放大预览。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const preview_1 = require("./preview");
const ImageBoxInner = (props) => {
    const { token } = (0, theme_1.useToken)();
    const { src, width = '100%', height = 160, resizeMode = 'cover', radius, shape = 'rounded', alt, fallback, caption, preview, style } = props;
    const numericMin = Math.min(typeof width === 'number' ? width : Infinity, typeof height === 'number' ? height : Infinity);
    const r = shape === 'circle'
        ? Number.isFinite(numericMin)
            ? numericMin / 2
            : 9999
        : shape === 'square'
            ? 0
            : radius ?? token.borderRadiusLG;
    const empty = !src;
    const [pvOpen, setPvOpen] = react_1.default.useState(false);
    const previewEnabled = !!preview && !!src;
    const pvImages = react_1.default.useMemo(() => {
        if (preview && typeof preview === 'object' && preview.images)
            return preview.images;
        return [{ src, alt }];
    }, [preview, src, alt]);
    const body = (react_1.default.createElement(components_1.View, { style: [
            { width, height, borderRadius: r, overflow: 'hidden', backgroundColor: token.colorFillSecondary },
            style,
        ] },
        empty ? (react_1.default.createElement(components_1.View, { style: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: token.marginXXS } }, fallback != null ? (fallback) : (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(icon_1.Icon, { name: "picture", size: Math.min(32, (Number(height) || 160) * 0.3), color: token.colorTextQuaternary, strokeWidth: 1.5 }),
            alt != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextQuaternary } }, alt)) : null)))) : (react_1.default.createElement(components_1.Image, { source: src, resizeMode: resizeMode, style: { width: '100%', height: '100%' } })),
        caption != null ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: token.paddingXS,
                paddingVertical: token.paddingXXS,
                backgroundColor: token.colorBgContainer,
            } }, typeof caption === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } }, caption)) : (caption))) : null));
    return (react_1.default.createElement(components_1.View, null,
        previewEnabled ? (react_1.default.createElement(components_1.Pressable, { onPress: () => setPvOpen(true) }, body)) : (body),
        previewEnabled ? (react_1.default.createElement(preview_1.ImagePreview, { visible: pvOpen, images: pvImages, onClose: () => setPvOpen(false) })) : null));
};
exports.ImageBox = Object.assign(ImageBoxInner, { Preview: preview_1.ImagePreview });
exports.default = exports.ImageBox;
