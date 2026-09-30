"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Highlight = Highlight;
// Highlight：关键词高亮。把命中的子串以主色底 + 加粗呈现，用于搜索结果回显。
// 多关键词同时匹配（按出现位置归并），大小写默认不敏感；highlightAll=false 只高亮首个命中。
// 渲染为 View(row+wrap) 包兄弟 Text（本栈 Text 不可嵌套），逐片段成块、超宽换行。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
/** 按关键词把 text 切成 命中/未命中 片段（区间归并：重叠区间合并成一片）。 */
function splitHits(text, keywords, caseSensitive, all) {
    if (text === '' || keywords.length === 0)
        return [{ t: text, hit: false }];
    const haystack = caseSensitive ? text : text.toLowerCase();
    const spans = [];
    for (const kw of keywords) {
        if (kw === '')
            continue;
        const needle = caseSensitive ? kw : kw.toLowerCase();
        let from = 0;
        for (;;) {
            const at = haystack.indexOf(needle, from);
            if (at < 0)
                break;
            spans.push([at, at + needle.length]);
            if (!all)
                break;
            from = at + needle.length;
        }
        if (!all && spans.length > 0)
            break;
    }
    if (spans.length === 0)
        return [{ t: text, hit: false }];
    // 起点排序后归并重叠区间
    spans.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged = [spans[0]];
    for (let i = 1; i < spans.length; i++) {
        const last = merged[merged.length - 1];
        if (spans[i][0] <= last[1])
            last[1] = Math.max(last[1], spans[i][1]);
        else
            merged.push(spans[i]);
    }
    const pieces = [];
    let cursor = 0;
    for (const [s, e] of merged) {
        if (s > cursor)
            pieces.push({ t: text.slice(cursor, s), hit: false });
        pieces.push({ t: text.slice(s, e), hit: true });
        cursor = e;
    }
    if (cursor < text.length)
        pieces.push({ t: text.slice(cursor), hit: false });
    return pieces;
}
function Highlight(props) {
    const { token } = (0, theme_1.useToken)();
    const { text, keyword, highlightAll = true, caseSensitive = false, color, style } = props;
    const keywords = (Array.isArray(keyword) ? keyword : keyword == null ? [] : [keyword]).filter((k) => k !== '');
    const pieces = splitHits(String(text ?? ''), keywords, caseSensitive, highlightAll);
    const hitColor = color ?? token.colorPrimary;
    const bg = hitHighlightBg(hitColor);
    const base = { fontSize: token.fontSize, lineHeight: Math.round(token.fontSize * 1.7) };
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }, style] }, pieces.map((p, i) => p.hit ? (react_1.default.createElement(components_1.Text, { key: i, preserveTrailingSpace: true, style: { ...base, color: hitColor, fontWeight: '600', backgroundColor: bg, borderRadius: token.borderRadiusSM, paddingHorizontal: 1 } }, p.t)) : (react_1.default.createElement(components_1.Text, { key: i, preserveTrailingSpace: true, style: { ...base, color: token.colorText } }, p.t)))));
}
/** 命中底色：主色 8 位 hex 直接改 alpha；6 位 hex / 其他格式回退半透明黄。 */
function hitHighlightBg(hex) {
    if (/^#[0-9a-fA-F]{6}$/.test(hex))
        return `${hex}26`;
    if (/^#[0-9a-fA-F]{8}$/.test(hex))
        return `${hex.slice(0, 7)}26`;
    return '#faad1426';
}
exports.default = Highlight;
