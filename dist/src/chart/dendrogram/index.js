"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DendrogramChart = DendrogramChart;
// DendrogramChart：生态树。所有叶在同一 depth（水平/垂直视图下叶对齐成一列/一行；径向视图下叶在同一圆周）。
// 三方向共用同一份 layoutDendrogram 抽象坐标，toXY 按 direction 投影；CanvasLayer 单节点承载全树。
// 入场动画：按 depth 逐层揭示（reveal 0→1，绘制层按 depth ≤ maxDepth * reveal 截断）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const canvas_layer_1 = require("../core/canvas-layer");
const common_1 = require("../core/common");
const tree_layout_1 = require("../core/tree-layout");
const tree_render_1 = require("../core/tree-render");
function DendrogramChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, width, height, direction = 'horizontal', nodeRadius = 8, nodeColor = theme.primary, edgeColor = theme.axisLine, edgeWidth = 1.2, labelColor = theme.label, fontSize = theme.labelSize + 1, paddingMain = 40, paddingCross = 20, innerRadius = 30, animation = true, animateDuration = 900, style, } = props;
    const reveal = (0, common_1.useEnter)(animation, animateDuration);
    const { positions, leafCount, maxDepth } = (0, tree_layout_1.layoutDendrogram)(data);
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
exports.default = DendrogramChart;
