"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = Result;
// Result：状态图标 + 标题 + 副标题 + 额外操作区。
// 图标直接用 Icon 矢量层（自带圆环的 checkCircle / closeCircle / warning / infoCircle）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
// HTTP 状态码预设标题
const HTTP_PRESET = {
    '404': { title: '404', subTitle: '抱歉，你访问的页面不存在。' },
    '403': { title: '403', subTitle: '抱歉，你无权访问该页面。' },
    '500': { title: '500', subTitle: '抱歉，服务器发生错误。' },
};
function Result(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Result');
    const { status = 'info', title, subTitle, extra, icon, children, style } = props;
    const http = status === '404' || status === '403' || status === '500';
    const theme = (() => {
        switch (status) {
            case 'success':
                return { fg: token.colorSuccess, icon: 'checkCircle' };
            case 'error':
                return { fg: token.colorError, icon: 'closeCircle' };
            case 'warning':
                return { fg: token.colorWarning, icon: 'warning' };
            default:
                return { fg: token.colorInfo, icon: 'infoCircle' };
        }
    })();
    const iconSize = ct.iconFontSize;
    return (react_1.default.createElement(components_1.View, { style: [{ alignItems: 'center', paddingVertical: token.paddingLG }, style] },
        http ? (react_1.default.createElement(components_1.Text, { style: { fontSize: ct.iconFontSize * 1.4, fontWeight: '700', color: token.colorText } }, status)) : icon != null ? (react_1.default.createElement(components_1.View, null, icon)) : (react_1.default.createElement(icon_1.Icon, { name: theme.icon, size: iconSize, color: theme.fg, strokeWidth: 1.5 })),
        title != null || http ? (react_1.default.createElement(components_1.Text, { style: { marginTop: token.margin, fontSize: ct.titleFontSize, fontWeight: '500', color: token.colorText } }, http ? title ?? HTTP_PRESET[status].title : title)) : null,
        subTitle != null || http ? (react_1.default.createElement(components_1.Text, { style: { marginTop: token.marginXS, fontSize: ct.subtitleFontSize, color: token.colorTextTertiary } }, http ? subTitle ?? HTTP_PRESET[status].subTitle : subTitle)) : null,
        extra != null ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', marginTop: token.marginLG } }, extra)) : null,
        children ? react_1.default.createElement(components_1.View, { style: { marginTop: token.marginLG, alignSelf: 'stretch' } }, children) : null));
}
