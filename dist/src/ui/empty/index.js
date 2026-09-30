"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = Empty;
// Empty：无数据占位。默认用 inbox 矢量插画（Icon 层），可 image 自定义插画 / imageStyle 调尺寸。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
function Empty(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Empty');
    const { description = '暂无数据', image, imageStyle, imageSize = 64, children, style } = props;
    const defaultImage = (react_1.default.createElement(components_1.View, { style: { width: imageSize, height: imageSize * 0.85, alignItems: 'center', justifyContent: 'center' } },
        react_1.default.createElement(icon_1.Icon, { name: "inbox", size: imageSize, color: ct.color, strokeWidth: 1.5 })));
    return (react_1.default.createElement(components_1.View, { style: [{ alignItems: 'center', paddingVertical: token.paddingLG }, style] },
        react_1.default.createElement(components_1.View, { style: imageStyle }, image != null ? image : defaultImage),
        description != null ? (react_1.default.createElement(components_1.Text, { style: { marginTop: token.marginSM, fontSize: ct.fontSize, color: ct.color } }, description)) : null,
        children ? react_1.default.createElement(components_1.View, { style: { marginTop: token.margin } }, children) : null));
}
exports.default = Empty;
