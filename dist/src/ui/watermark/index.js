"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watermark = Watermark;
// WATERMARK：内容水印。平铺旋转文本覆盖层（Text.rotate 只转绘制不动布局），
// 尺寸靠 onLayout 实测后铺格子；mode='embed' 时作为普通块嵌入文档流。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const color_1 = require("../../utils/color");
function Watermark(props) {
    const { token } = (0, theme_1.useToken)();
    const { content = 'Flux Skia', gap = [48, 40], fontSize = token.fontSizeLG, rotate = -22, fontColor, fontWeight, fontFamily, mode = 'cover', height, children, style, } = props;
    const [box, setBox] = react_1.default.useState({ w: 0, h: 0 });
    const onLayout = (e) => {
        const { w, h } = e.nativeEvent.layout;
        if (Math.abs(w - box.w) > 0.5 || Math.abs(h - box.h) > 0.5)
            setBox({ w, h });
    };
    const lines = Array.isArray(content) ? content : [content];
    const lineH = fontSize * 1.5;
    // 估算水印单元宽：取最长行，中文字符 ≈ fontSize，留 16px 呼吸
    const cellW = Math.max(...lines.map((l) => l.length)) * fontSize + 16;
    const cellH = lines.length * lineH;
    // 默认水印色跟随主题：暗色下用白字淡入，亮色下黑字淡入
    const color = fontColor ?? (0, color_1.fade)(token.colorTextBase, 0.15);
    const tiles = [];
    if (box.w > 0 && box.h > 0) {
        const stepX = cellW + gap[0];
        const stepY = cellH + gap[1];
        const cols = Math.ceil(box.w / stepX) + 1;
        const rows = Math.ceil(box.h / stepY) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                lines.forEach((line, li) => {
                    tiles.push(react_1.default.createElement(components_1.Text, { key: `${r}-${c}-${li}`, rotate: rotate, style: {
                            position: 'absolute',
                            left: c * stepX - cellW / 2,
                            top: r * stepY - cellH / 2 + li * lineH,
                            width: cellW,
                            height: lineH,
                            textAlign: 'center',
                            fontSize,
                            fontWeight,
                            fontFamily,
                            color,
                        } }, line));
                });
            }
        }
    }
    if (mode === 'embed') {
        return (react_1.default.createElement(components_1.View, { onLayout: onLayout, style: {
                width: '100%',
                height: height ?? fontSize * 8,
                backgroundColor: token.colorBgContainer,
                overflow: 'hidden',
                ...flattenStyleish(style),
            } }, tiles));
    }
    return (react_1.default.createElement(components_1.View, { onLayout: onLayout, style: { position: 'relative', ...flattenStyleish(style) } },
        children,
        react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' } }, tiles)));
}
/** style 可能是数组/对象，Watermark 需要把它摊平后与内部样式合并 */
function flattenStyleish(style) {
    if (!style)
        return {};
    if (Array.isArray(style))
        return Object.assign({}, ...style.filter(Boolean));
    return style;
}
