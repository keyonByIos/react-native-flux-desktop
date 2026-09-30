"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Avatar = Web3Avatar;
// Web3Avatar：由钱包地址确定性生成的像素身份头像（Ethereum Blockies 风格）。
// 同一地址恒定同一图案与配色；8×8 网格逐格用绝对定位 View 拼方块的轴对齐矩形，天然无锯齿。
// shape 支持 circle / square；圆角外框只裁轮廓不改内部格，故无接缝缺口。纯展示、无副作用。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const utils_1 = require("../utils");
function Web3Avatar(props) {
    const { token } = (0, theme_1.useToken)();
    const { address, size = token.controlHeightLG, shape = 'square', grid = 8, style } = props;
    const blk = react_1.default.useMemo(() => (0, utils_1.blockies)(address, grid), [address, grid]);
    const cell = size / blk.size;
    const nodes = [];
    for (let r = 0; r < blk.size; r++) {
        for (let c = 0; c < blk.size; c++) {
            const s = blk.shade[r][c];
            if (s === 0)
                continue;
            const color = s === 1 ? blk.color : blk.spotColor;
            nodes.push(react_1.default.createElement(components_1.View, { key: `${r}-${c}`, style: {
                    position: 'absolute',
                    left: Math.floor(c * cell),
                    top: Math.floor(r * cell),
                    width: Math.ceil(cell),
                    height: Math.ceil(cell),
                    backgroundColor: color,
                } }));
        }
    }
    return (react_1.default.createElement(components_1.View, { style: [
            {
                width: size,
                height: size,
                borderRadius: shape === 'circle' ? size / 2 : token.borderRadiusSM,
                backgroundColor: blk.bgColor,
                overflow: 'hidden',
            },
            style,
        ] }, nodes));
}
exports.default = Web3Avatar;
