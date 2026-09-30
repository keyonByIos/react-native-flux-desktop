"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCode = QRCode;
// QRCODE：二维码展示。把 value 确定性映射成「类 QR 矩阵」（定位角 + 时序 + 数据模块），
// 整张图编译成一条 fill path 交单个 Icon 节点绘制（节点数=1，性能友好）。
// 说明：这是视觉忠实的占位实现（可辨识的 QR 外观 + 稳定 value→图案），未做可扫描的完整 QR 纠错编码（见 OPEN_QUESTIONS）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const spin_1 = require("../spin");
// FNV-1a 字符串哈希 → 32 位无符号
function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
}
// mulberry32：由 seed 产出确定性伪随机序列
function prng(seed) {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
// 生成 N×N 布尔矩阵（true=黑）。finder 三定位角 + timing 时序 + 数据区按 value 哈希填充
function buildMatrix(value, n) {
    const m = Array.from({ length: n }, () => Array(n).fill(false));
    const inFinder = (r, c) => (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
    const finderAt = (r, c) => {
        // 相对某定位角左上原点画 7×7 回字
        const local = (lr, lc) => {
            const ring = lr === 0 || lr === 6 || lc === 0 || lc === 6;
            const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
            return ring || core;
        };
        if (r < 8 && c < 8)
            return r < 7 && c < 7 && local(r, c);
        if (r < 8 && c >= n - 8) {
            const lc = c - (n - 7);
            return r < 7 && lc >= 0 && lc < 7 && local(r, lc);
        }
        if (r >= n - 8 && c < 8) {
            const lr = r - (n - 7);
            return lr >= 0 && lr < 7 && c < 7 && local(lr, c);
        }
        return false;
    };
    const rand = prng(hash(value || 'flux'));
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (inFinder(r, c)) {
                m[r][c] = finderAt(r, c);
                continue;
            }
            // 时序图案（第 6 行/列交替）
            if (r === 6) {
                m[r][c] = c % 2 === 0;
                continue;
            }
            if (c === 6) {
                m[r][c] = r % 2 === 0;
                continue;
            }
            m[r][c] = rand() > 0.5;
        }
    }
    return m;
}
// 矩阵 → 单条 fill path（每个黑格一个 1×1 矩形子路径）
function matrixToPath(m, n) {
    let d = '';
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (m[r][c])
                d += `M${c} ${r}h1v1h-1z`;
        }
    }
    return d;
}
function QRCode(props) {
    const { token } = (0, theme_1.useToken)();
    const { value = '', size = token.controlHeightLG * 4, color, bgColor, bordered = true, status = 'active', modules = 25, icon, iconSize, onRefresh, statusRender, style, } = props;
    const fg = color ?? token.colorText;
    const bg = bgColor ?? token.colorBgContainer;
    const path = react_1.default.useMemo(() => matrixToPath(buildMatrix(value, modules), modules), [value, modules]);
    return (react_1.default.createElement(components_1.View, { style: [
            {
                width: size,
                height: size,
                padding: token.paddingXS,
                backgroundColor: bg,
                borderRadius: token.borderRadiusLG,
                borderWidth: bordered ? token.lineWidth : 0,
                borderStyle: 'solid',
                borderColor: token.colorBorderSecondary,
                alignItems: 'center',
                justifyContent: 'center',
            },
            style,
        ] },
        react_1.default.createElement(icon_1.Icon, { path: path, vb: modules, mode: "fill", size: size - token.paddingXS * 2, color: fg }),
        icon != null && status === 'active' ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
                width: iconSize,
                height: iconSize,
                padding: iconSize == null ? token.paddingXXS : 0,
                backgroundColor: bg,
                borderRadius: token.borderRadius,
            } }, icon)) : null,
        statusRender ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, opacity: 0.92, borderRadius: token.borderRadiusLG } }, statusRender({ status, onRefresh }))) : null,
        statusRender == null && status === 'loading' ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, opacity: 0.85, borderRadius: token.borderRadiusLG } },
            react_1.default.createElement(spin_1.Spin, null))) : null,
        statusRender == null && status === 'scanned' ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, opacity: 0.92, borderRadius: token.borderRadiusLG } },
            react_1.default.createElement(icon_1.Icon, { name: "check", size: token.fontSizeXL, color: token.colorSuccess }),
            react_1.default.createElement(components_1.Text, { style: { marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary } }, "\u5DF2\u626B\u63CF"))) : null,
        statusRender == null && status === 'expired' ? (react_1.default.createElement(components_1.Pressable, { onPress: onRefresh, style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, opacity: 0.92, borderRadius: token.borderRadiusLG } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } }, "\u4E8C\u7EF4\u7801\u5DF2\u5931\u6548"),
            react_1.default.createElement(components_1.View, { style: { marginTop: token.marginXS, paddingHorizontal: token.paddingXS, paddingVertical: token.paddingXXS, borderRadius: token.borderRadius, borderWidth: token.lineWidth, borderStyle: 'solid', borderColor: token.colorPrimary } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorPrimary } }, "\u70B9\u51FB\u5237\u65B0")))) : null));
}
exports.default = QRCode;
