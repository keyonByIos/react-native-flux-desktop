"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DendrogrCompactChart = DendrogrCompactChart;
// DendrogrCompactChart：紧凑树。叶可在不同 depth（子树叶数少则占槽少，视觉更紧凑）。
// 三方向共用 layoutCompactBox；渲染层与 Dendrogram 完全一致，只是布局算法不同。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const canvas_layer_1 = require("../core/canvas-layer");
const common_1 = require("../core/common");
const tree_layout_1 = require("../core/tree-layout");
const tree_render_1 = require("../core/tree-render");
function DendrogrCompactChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, width, height, direction = 'horizontal', nodeRadius = 8, nodeColor = theme.primary, edgeColor = theme.axisLine, edgeWidth = 1.2, labelColor = theme.label, fontSize = theme.labelSize + 1, paddingMain = 40, paddingCross = 20, innerRadius = 30, animation = true, animateDuration = 900, style, } = props;
    const reveal = (0, common_1.useEnter)(animation, animateDuration);
    const { positions, leafCount, maxDepth } = (0, tree_layout_1.layoutCompactBox)(data);
    const points = (0, tree_layout_1.toXY)(positions, leafCount, maxDepth, {
        direction, width, height, paddingMain, paddingCross, innerRadius,
    });
    const edges = (0, tree_layout_1.buildEdges)(points);
    const draw = (ctx) => {
        (0, tree_render_1.drawTree)(ctx, points, edges, {
            direction, nodeRadius, nodeColor, edgeColor, edgeWidth,
            labelColor, fontSize, fontFamily: theme.fontFamily, reveal,
        });
    };
    const deps = [
        JSON.stringify(data), direction, width, height, reveal,
        nodeRadius, nodeColor, edgeColor, edgeWidth, labelColor, fontSize,
        paddingMain, paddingCross, innerRadius,
    ];
    return (react_1.default.createElement(components_1.View, { style: [{ width, height, position: 'relative' }, style] },
        react_1.default.createElement(canvas_layer_1.CanvasLayer, { width: width, height: height, draw: draw, deps: deps })));
}
exports.default = DendrogrCompactChart;
