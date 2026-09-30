"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PALETTE = void 0;
exports.buildChartTheme = buildChartTheme;
exports.withAlpha = withAlpha;
exports.parseHex = parseHex;
exports.lighten = lighten;
exports.seriesColor = seriesColor;
/** 默认分类色板（AntV G2 lineage — 跨主题和谐）。 */
exports.DEFAULT_PALETTE = [
    '#5B8FF9',
    '#5AD8A6',
    '#F6BD16',
    '#6F5EF9',
    '#6DC8EC',
    '#945FB9',
    '#E86452',
    '#FF9845',
    '#1E9493',
    '#FF99C3',
];
function buildChartTheme(token) {
    return {
        axisLine: token.colorBorderSecondary,
        gridLine: token.colorSplit,
        label: token.colorTextTertiary,
        labelSize: token.fontSizeSM,
        fontFamily: token.fontFamily,
        palette: exports.DEFAULT_PALETTE,
        primary: token.colorPrimary,
        fillTrack: token.colorFillSecondary,
        tooltipBg: 'rgba(0,0,0,0.85)',
        tooltipText: 'rgba(255,255,255,0.92)',
        ink: token.colorBgBase,
    };
}
/** 给 `#RRGGBB` 追加/替换 2 位十六进制 alpha；其它格式原样返回。 */
function withAlpha(hex, aa) {
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${aa}` : hex;
}
/** 解析 `#RGB` / `#RRGGBB` 为 `[r,g,b]`；其它返回 null。 */
function parseHex(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3)
        h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h))
        return null;
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const clamp255 = (n) => Math.max(0, Math.min(255, Math.round(n)));
/** 向白色混合 `t`（0..1）——柱/面顶部提亮用。 */
function lighten(hex, t) {
    const rgb = parseHex(hex);
    if (!rgb)
        return hex;
    const [r, g, b] = rgb;
    const m = (c) => clamp255(c + (255 - c) * t);
    return `#${((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1)}`;
}
/** 取序列 `i` 的颜色，尊重覆盖（单色串 / 色板数组）。 */
function seriesColor(i, override, theme) {
    if (typeof override === 'string')
        return override;
    if (Array.isArray(override))
        return override[i % override.length] ?? theme.palette[i % theme.palette.length];
    return theme.palette[i % theme.palette.length];
}
