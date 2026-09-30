"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgChart = OrgChart;
// OrgChart：组织架构图。根在顶（vertical）或在左（horizontal），正交折线连接父子；
// 两种节点样式 simple（主色圆角块）/ card（人员卡：彩色顶条 + 头像 + 姓名 + 职务，带锚点圆与箭头）。
// 交叉轴超宽时布局自动压缩槽位（先收间距再收节点，文字渲染期截断）。渲染走 CanvasLayer 单画布。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const canvas_layer_1 = require("../core/canvas-layer");
const common_1 = require("../core/common");
const org_layout_1 = require("../core/org-layout");
const org_render_1 = require("../core/org-render");
function OrgChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, width, height, direction = 'vertical', nodeStyle = 'simple', nodeW, nodeH, gapX = 24, gapY = 64, padding = 24, fontSize = 12, nameFont = 11, subFont = 9.5, lineWidth = 1.2, animation = true, animateDuration = 600, style, } = props;
    // simple/card 的默认盒尺寸不同：未显式传入时按样式取
    const w = nodeW ?? (nodeStyle === 'card' ? 150 : 70);
    const h = nodeH ?? (nodeStyle === 'card' ? 46 : 36);
    const reveal = (0, common_1.useEnter)(animation, animateDuration);
    const draw = (ctx) => {
        const { boxes, edges } = (0, org_layout_1.layoutOrg)(data, {
            width, height, direction,
            nodeW: w, nodeH: h, gapX, gapY, padding,
        });
        (0, org_render_1.drawOrg)(ctx, boxes, edges, {
            nodeStyle,
            direction,
            fontFamily: theme.fontFamily,
            fontSize,
            nameFont,
            subFont,
            primary: theme.primary,
            edgeColor: theme.axisLine,
            cardBg: '#ffffff',
            cardBorder: '#e0e0e0',
            nameColor: '#262626',
            subColor: '#8c8c8c',
            lineWidth,
            reveal,
        });
    };
    const deps = [
        JSON.stringify(data), width, height, direction, nodeStyle, reveal,
        w, h, gapX, gapY, padding, fontSize, nameFont, subFont, lineWidth,
    ];
    return (react_1.default.createElement(components_1.View, { style: [{ width, height, position: 'relative' }, style] },
        react_1.default.createElement(canvas_layer_1.CanvasLayer, { width: width, height: height, draw: draw, deps: deps })));
}
exports.default = OrgChart;
