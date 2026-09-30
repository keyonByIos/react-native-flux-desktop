"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridLines = GridLines;
// Grid：从各笛卡尔图中抽出的「网格自定义」共享层。
// 过去每个图各自内联画网格（Plot 画横线、bar 画竖线、scatter 画双线、candlestick 逐 tick 画线），
// 自定义能力分散、无法统一。这里把「是否显示 / 线色 / 实线虚线 / 线宽」收敛成一个 GridConfig + 一个
// GridLines 渲染器：调用方只负责算出网格的像素位置（horizontal=y、vertical=x），样式统一交给本模块。
// 虚线沿用管线既有画法（3px 薄片按 6px 步长拼），与本栈「View 拼装、Skia 光栅化」的抗锯齿策略一致。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
/** 按给定像素位渲染横/纵网格线；config.show=false 时整体不画。须放在一个 position:relative 容器内。 */
function GridLines(props) {
    const { area, horizontal = [], vertical = [], config, fallbackColor = '#E5E5E5' } = props;
    if (config?.show === false)
        return react_1.default.createElement(react_1.default.Fragment, null);
    const color = config?.color ?? fallbackColor;
    const th = config?.thickness ?? 1;
    const dashed = config?.dashed ?? false;
    const nodes = [];
    horizontal.forEach((y, i) => {
        if (dashed) {
            for (let x = area.left; x < area.left + area.width; x += 6) {
                nodes.push(react_1.default.createElement(components_1.View, { key: `h${i}-${x}`, style: { position: 'absolute', left: x, top: y, width: 3, height: th, backgroundColor: color } }));
            }
        }
        else {
            nodes.push(react_1.default.createElement(components_1.View, { key: `h${i}`, style: { position: 'absolute', left: area.left, top: y, width: area.width, height: th, backgroundColor: color } }));
        }
    });
    vertical.forEach((x, i) => {
        if (dashed) {
            for (let y = area.top; y < area.top + area.height; y += 6) {
                nodes.push(react_1.default.createElement(components_1.View, { key: `v${i}-${y}`, style: { position: 'absolute', left: x, top: y, width: th, height: 3, backgroundColor: color } }));
            }
        }
        else {
            nodes.push(react_1.default.createElement(components_1.View, { key: `v${i}`, style: { position: 'absolute', left: x, top: area.top, width: th, height: area.height, backgroundColor: color } }));
        }
    });
    return react_1.default.createElement(react_1.default.Fragment, null, nodes);
}
exports.default = GridLines;
