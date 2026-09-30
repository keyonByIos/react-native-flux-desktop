"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = Address;
// Address：加密货币地址的展示组件（参照 @ant-design/web3 Address，仅展示）。
// 一行内：地址身份头像（可关）/ ENS 或截断地址 / 链标签 / 复制（点击→勾选反馈，纯展示不落盘）/
// 二维码（点图标→下方浮出 QRCode 卡片）/ 浏览器外链图标。轴对齐 + 复用现成原子件，无自绘斜边。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const tag_1 = require("../../ui/tag");
const qr_code_1 = require("../../ui/qr-code");
const avatar_1 = require("../avatar");
const utils_1 = require("../utils");
const SIZE_MAP = { small: 'fontSizeSM', middle: 'fontSize', large: 'fontSizeLG' };
function Address(props) {
    const { token } = (0, theme_1.useToken)();
    const { address, name, chain, chainColor, truncated = true, prefix, copyable = true, scanCode = true, openInExplorer = false, size = 'middle', style, } = props;
    const [copied, setCopied] = react_1.default.useState(false);
    const [qr, setQr] = react_1.default.useState(false);
    const shown = name ??
        (truncated === false
            ? address
            : (0, utils_1.truncateAddress)(address, typeof truncated === 'object' ? truncated.lead ?? 6 : 6, typeof truncated === 'object' ? truncated.trail ?? 4 : 4));
    const fs = token[SIZE_MAP[size]];
    const avatarPx = size === 'small' ? token.controlHeightSM : size === 'large' ? token.controlHeight : token.fontSizeLG;
    const doCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }, style] },
        prefix !== false ? (react_1.default.createElement(components_1.View, { style: { marginRight: token.marginXS } }, prefix ?? react_1.default.createElement(avatar_1.Web3Avatar, { address: address, size: avatarPx, shape: "circle" }))) : null,
        react_1.default.createElement(components_1.Text, { selectable: true, style: { fontSize: fs, color: token.colorText } }, shown),
        chain ? (react_1.default.createElement(components_1.View, { style: { marginLeft: token.marginXS } },
            react_1.default.createElement(tag_1.Tag, { color: chainColor ?? 'processing' }, chain))) : null,
        copyable ? (react_1.default.createElement(components_1.Pressable, { onPress: doCopy, style: { marginLeft: token.marginXS, alignItems: 'center', justifyContent: 'center' } },
            react_1.default.createElement(icon_1.Icon, { name: copied ? 'check' : 'copy', size: fs, color: copied ? token.colorSuccess : token.colorTextTertiary, strokeWidth: 2 }))) : null,
        scanCode ? (react_1.default.createElement(components_1.Pressable, { onPress: () => setQr((v) => !v), style: { marginLeft: token.marginSM, alignItems: 'center', justifyContent: 'center' } },
            react_1.default.createElement(icon_1.Icon, { name: "camera", size: fs, color: qr ? token.colorPrimary : token.colorTextTertiary, strokeWidth: 2 }))) : null,
        openInExplorer ? (react_1.default.createElement(components_1.Pressable, { style: { marginLeft: token.marginSM, alignItems: 'center', justifyContent: 'center' } },
            react_1.default.createElement(icon_1.Icon, { name: "link", size: fs, color: token.colorLink, strokeWidth: 2 }))) : null,
        qr ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: 0,
                top: avatarPx + token.marginXS,
                padding: token.paddingSM,
                backgroundColor: token.colorBgElevated,
                borderRadius: token.borderRadiusLG,
                borderWidth: token.lineWidth,
                borderColor: token.colorBorderSecondary,
                zIndex: 10,
            } },
            react_1.default.createElement(qr_code_1.QRCode, { value: address, size: 140, bordered: false }))) : null));
}
exports.default = Address;
