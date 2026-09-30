"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = tokenize;
exports.lineHeightOf = lineHeightOf;
exports.textWidth = textWidth;
exports.layoutText = layoutText;
exports.measureTextBlock = measureTextBlock;
exports.measureSingleLineWidth = measureSingleLineWidth;
exports.caretIndexAtX = caretIndexAtX;
exports.wrapText = wrapText;
// 文字度量与换行。Yoga 的 measure 回调和 Painter 的实际绘制共用这里的同一套算法，
// 否则会出现「布局给的空间」和「文字真实占位」不一致（Qt 版正是栽在这上面）。
const canvas_1 = require("@napi-rs/canvas");
const fonts_1 = require("./fonts");
let scratch = null;
function measureCtx() {
    if (!scratch)
        scratch = (0, canvas_1.createCanvas)(1, 1).getContext('2d');
    return scratch;
}
/** CJK 及全角标点：可在任意字符间断行；拉丁文只能按词断 */
const CJK = /[\u2e80-\u2eff\u3000-\u303f\u3040-\u30ff\u31c0-\u31ef\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;
/** 把文本切成断行单元：CJK 单字、拉丁单词、空白、换行 */
function tokenize(text) {
    const tokens = [];
    let buf = '';
    const flush = () => {
        if (buf) {
            tokens.push(buf);
            buf = '';
        }
    };
    for (const ch of text) {
        if (ch === '\n') {
            flush();
            tokens.push('\n');
        }
        else if (ch === ' ' || ch === '\t') {
            flush();
            tokens.push(ch);
        }
        else if (CJK.test(ch)) {
            flush();
            tokens.push(ch);
        }
        else {
            buf += ch;
        }
    }
    flush();
    return tokens;
}
function lineHeightOf(style) {
    const fs = Number(style.fontSize) || 14;
    const lh = style.lineHeight;
    if (lh === undefined || lh === null)
        return Math.round(fs * 1.4);
    const n = parseFloat(String(lh));
    if (!Number.isFinite(n))
        return Math.round(fs * 1.4);
    if (String(lh).endsWith('px'))
        return n;
    // RN 语义下 number 是绝对像素；但 antd token 传的是倍数（1.5714 之类）。
    // 小于字号的值不可能是行高，按倍数处理——两种写法都能拿到合理结果。
    return n < fs ? Math.round(fs * n) : n;
}
function textWidth(ctx, text) {
    if (!text)
        return 0;
    const ls = Number(ctx.letterSpacing);
    const w = ctx.measureText(text).width;
    // letterSpacing 在部分 canvas 实现里不生效，手动补偿（末尾不加）
    return ls ? w + ls * Math.max(0, [...text].length - 1) : w;
}
/**
 * 换行排版。
 * @param availWidth 可用宽度；Infinity 表示不约束（单行按内容展开）
 * @param maxLines   numberOfLines；undefined/0 表示不限
 */
function layoutText(rawText, style, availWidth = Infinity, maxLines, preserveSpace = false) {
    // 布局缓存：同一文本+字体+约束的结果在动画期间会被每帧重复请求，
    // 命中缓存可把 measureText 的 O(n²) 开销从帧循环里彻底拿掉。
    // availWidth 量化到 0.5px 提高命中率；缓存有界，溢出时整体清空重建。
    const font = (0, fonts_1.fontShorthand)(style);
    const ls = style.letterSpacing === undefined ? '' : `|${style.letterSpacing}`;
    const key = font + ls + '|' + (Number.isFinite(availWidth) ? Math.round(availWidth * 2) / 2 : 'inf') + '|' + (maxLines || '') + '|' + (preserveSpace ? 'P' : '') + '|' + rawText;
    const hit = layoutCache.get(key);
    if (hit)
        return hit;
    const layout = computeLayout(rawText, style, availWidth, maxLines, font, preserveSpace);
    if (layoutCache.size >= LAYOUT_CACHE_MAX)
        layoutCache.clear();
    layoutCache.set(key, layout);
    return layout;
}
const LAYOUT_CACHE_MAX = 5000;
const layoutCache = new Map();
function computeLayout(rawText, style, availWidth, maxLines, font, preserveSpace = false) {
    const ctx = measureCtx();
    ctx.font = font;
    // 必须显式重置：scratch ctx 全局复用，上一段的 letterSpacing 不能泄漏到这一段
    ctx.letterSpacing = style.letterSpacing !== undefined ? `${style.letterSpacing}px` : '0px';
    const lineHeight = lineHeightOf(style);
    const text = rawText ?? '';
    const paragraphs = text.split('\n');
    const lines = [];
    let truncated = false;
    const pushLine = (t) => lines.push({ text: t, width: textWidth(ctx, t) });
    for (const para of paragraphs) {
        if (para === '') {
            pushLine('');
            continue;
        }
        const tokens = tokenize(para);
        let cur = '';
        for (const tk of tokens) {
            const candidate = cur + tk;
            if (cur !== '' && Number.isFinite(availWidth) && textWidth(ctx, candidate) > availWidth) {
                pushLine(cur.replace(/\s+$/, ''));
                cur = tk === ' ' ? '' : tk;
            }
            else {
                cur = candidate;
            }
        }
        if (cur !== '')
            pushLine(preserveSpace ? cur : cur.replace(/\s+$/, ''));
    }
    if (maxLines && maxLines > 0 && lines.length > maxLines) {
        truncated = true;
        const kept = lines.slice(0, maxLines);
        const last = kept[maxLines - 1];
        // 逐字回退直到能塞下省略号
        let t = last.text + '…';
        while (t.length > 1 && textWidth(ctx, t) > availWidth) {
            t = t.slice(0, -2) + '…';
        }
        kept[maxLines - 1] = { text: t, width: textWidth(ctx, t) };
        lines.length = 0;
        lines.push(...kept);
    }
    const maxWidth = lines.reduce((m, l) => Math.max(m, l.width), 0);
    return { lines, lineHeight, maxWidth, height: lines.length * lineHeight, truncated };
}
/**
 * 给 Yoga measure 用：在父级约束下算文本占位。
 * 必须区分 MeasureMode——AtMost 下假设「填满约束」会让文本谎报宽度，
 * 父容器就会按错误宽度算行数，表现为文字溢出卡片。
 * @param widthMode 0=Undefined 1=Exactly 2=AtMost（与 Yoga MeasureMode 一致）
 */
function measureTextBlock(rawText, style, availWidth, widthMode, maxLines, preserveSpace = false) {
    const EXACTLY = 1;
    const AT_MOST = 2;
    const constrained = widthMode === EXACTLY || widthMode === AT_MOST;
    const boxWidth = constrained && availWidth > 0 ? availWidth : Infinity;
    const layout = layoutText(rawText, style, boxWidth, maxLines, preserveSpace);
    let width;
    if (widthMode === EXACTLY)
        width = availWidth; // 父给定死宽，照抄
    else if (widthMode === AT_MOST)
        width = Math.min(layout.maxWidth, availWidth); // 能多窄就多窄，但不超约束
    else
        width = layout.maxWidth; // 无约束：自然宽
    return { width: Math.ceil(width), height: Math.ceil(layout.height) };
}
/** 设好字体/字距到 scratch ctx（单行测量专用） */
function prepFont(ctx, style) {
    ctx.font = (0, fonts_1.fontShorthand)(style);
    ctx.letterSpacing = style.letterSpacing !== undefined ? `${style.letterSpacing}px` : '0px';
}
/** 单行（不换行）文本宽度：Input 光标水平定位、滚动估算用 */
function measureSingleLineWidth(text, style) {
    const ctx = measureCtx();
    prepFont(ctx, style);
    return textWidth(ctx, text || '');
}
/**
 * 点击落位：给定整段文本与从内容盒左边算起的逻辑 x，返回最近的光标索引（按码点，0..len）。
 * 逐前缀测宽取最接近 x 的切点；对 ASCII 输入足够精确，CJK 也按字宽近似可接受。
 */
function caretIndexAtX(text, style, x) {
    const chars = [...(text || '')];
    const ctx = measureCtx();
    prepFont(ctx, style);
    let best = 0;
    let bestDist = Math.abs(x); // 切点 0 的宽度为 0
    let prefix = '';
    for (let i = 0; i < chars.length; i++) {
        prefix += chars[i];
        const d = Math.abs(textWidth(ctx, prefix) - x);
        if (d < bestDist) {
            bestDist = d;
            best = i + 1;
        }
    }
    return best;
}
/** 从 i 起取一个断行单元（CJK 单字 / 拉丁整词 / 连续空白），返回子串与码点长 */
function nextToken(chars, i, end) {
    const ch = chars[i];
    if (ch === ' ' || ch === '\t') {
        let j = i;
        while (j < end && (chars[j] === ' ' || chars[j] === '\t'))
            j++;
        return { tok: chars.slice(i, j).join(''), len: j - i };
    }
    if (CJK.test(ch))
        return { tok: ch, len: 1 };
    let j = i;
    while (j < end && chars[j] !== ' ' && chars[j] !== '\t' && !CJK.test(chars[j]))
        j++;
    return { tok: chars.slice(i, j).join(''), len: j - i };
}
/**
 * 将文本按 availWidth 软换行（\n 为硬断），返回每可视行的码点区间。
 * @param availWidth 可用宽度；Infinity 表示按内容展开（只受 \n 分行）
 */
function wrapText(rawText, style, availWidth) {
    const chars = Array.from(rawText ?? '');
    const n = chars.length;
    const ctx = measureCtx();
    prepFont(ctx, style);
    const lines = [];
    const pushSoft = (start, endIdx, hard) => {
        const t = chars.slice(start, endIdx).join('');
        lines.push({ start, end: endIdx, text: t, width: textWidth(ctx, t), hard });
    };
    let i = 0; // 码点指针，逐段（按 \n 切）处理
    while (i <= n) {
        let pEnd = i;
        while (pEnd < n && chars[pEnd] !== '\n')
            pEnd++;
        if (pEnd === i) {
            // 空段（连续换行或行首空）：产一条空行，区间 [i,i)
            pushSoft(i, i, true);
        }
        else {
            let curStart = i;
            let cur = '';
            let k = i;
            while (k < pEnd) {
                const { tok, len } = nextToken(chars, k, pEnd);
                const candidate = cur + tok;
                if (cur !== '' && Number.isFinite(availWidth) && textWidth(ctx, candidate) > availWidth) {
                    pushSoft(curStart, k, false); // 软断：[curStart,k) 已成行
                    curStart = k;
                    cur = tok;
                }
                else {
                    cur = candidate;
                }
                k += len;
            }
            pushSoft(curStart, pEnd, true);
        }
        if (pEnd >= n)
            break; // 文本结束
        i = pEnd + 1; // 跳过换行符
    }
    return lines;
}
