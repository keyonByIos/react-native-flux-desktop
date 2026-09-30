"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawFlow = drawFlow;
const flow_layout_1 = require("./flow-layout");
const theme_1 = require("./theme");
/** 圆角矩形路径（手动 arcTo，兼容 @napi-rs/canvas）。 */
function rrPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}
/** 顶部方角、底部圆角的矩形路径（卡体白底区）。 */
function bottomRoundPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h));
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - rr);
    ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
    ctx.lineTo(x + rr, y + h);
    ctx.arcTo(x, y + h, x, y + h - rr, rr);
    ctx.closePath();
}
/** 文本截断：超宽时逐字回退加省略号。 */
function fitText(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW)
        return text;
    let s = text;
    while (s.length > 1 && ctx.measureText(s + '…').width > maxW)
        s = s.slice(0, -1);
    return s + '…';
}
/** 向 hex 混黑（0..1），高亮描边等需要比主色更深的色时用。 */
function darken(hex, t) {
    const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
    if (!m)
        return hex;
    const n = parseInt(m[1], 16);
    const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 - t))));
    return `#${((1 << 24) + (f(n >> 16 & 255) << 16) + (f(n >> 8 & 255) << 8) + f(n & 255)).toString(16).slice(1)}`;
}
/** 正交折线路径：源右缘 → midX 竖轨 → 目标左缘，两拐点圆角。 */
function elbowPath(ctx, x1, y1, x2, y2, midX, r) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    if (Math.abs(y2 - y1) < 0.5) {
        ctx.lineTo(x2, y2);
        return;
    }
    const dy = Math.sign(y2 - y1);
    const dx2 = Math.sign(x2 - midX) || 1;
    const rr = Math.max(0, Math.min(r, Math.abs(midX - x1) / 2, Math.abs(y2 - y1) / 2, Math.abs(x2 - midX) / 2));
    ctx.lineTo(midX - rr, y1);
    ctx.quadraticCurveTo(midX, y1, midX, y1 + rr * dy);
    ctx.lineTo(midX, y2 - rr * dy);
    ctx.quadraticCurveTo(midX, y2, midX + rr * dx2, y2);
    ctx.lineTo(x2, y2);
}
/** 目标左缘的右向箭头。 */
function arrow(ctx, x, y, size, color) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y - size * 0.55);
    ctx.lineTo(x - size, y + size * 0.55);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}
function drawEdge(ctx, e, opts) {
    const { edgeColor, edgeWidth, chain } = opts;
    const x1 = e.source.x + e.source.w;
    const y1 = e.source.y + e.source.h / 2;
    const x2 = e.target.x;
    const y2 = e.target.y + e.target.h / 2;
    const onChain = chain != null && chain.edges.has((0, flow_layout_1.edgeKey)(e.source.id, e.target.id));
    if (chain != null && onChain) {
        // 链路边：半透明宽底带 + 主色线
        ctx.lineCap = 'round';
        ctx.strokeStyle = (0, theme_1.withAlpha)(opts.primary, '33');
        ctx.lineWidth = 7;
        elbowPath(ctx, x1, y1, x2, y2, e.midX, 10);
        ctx.stroke();
        ctx.strokeStyle = chainTextEdge(opts);
        ctx.lineWidth = edgeWidth;
        elbowPath(ctx, x1, y1, x2, y2, e.midX, 10);
        ctx.stroke();
        arrow(ctx, x2 - 1, y2, 8, chainTextEdge(opts));
        return;
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = edgeWidth;
    elbowPath(ctx, x1, y1, x2, y2, e.midX, 10);
    ctx.stroke();
    arrow(ctx, x2 - 1, y2, 8, edgeColor);
}
function chainTextEdge(opts) {
    return darken(opts.primary, 0.15);
}
function drawNode(ctx, n, opts) {
    const { fontFamily, fontSize, subFontSize, primary, chain, selectedId } = opts;
    const color = n.color ?? primary;
    const onChain = chain == null || chain.nodes.has(n.id);
    const isSel = selectedId === n.id;
    if (chain != null) {
        // ── 链路高亮模式：全部节点白底描边盒 ──
        const stroke = onChain ? opts.chainStroke : opts.primary;
        const text = onChain ? opts.chainText : opts.primary;
        rrPath(ctx, n.x, n.y, n.w, n.h, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = isSel ? 3.5 : onChain ? 2.5 : 2;
        ctx.stroke();
        ctx.fillStyle = text;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fitText(ctx, n.label, n.w - 16), n.x + n.w / 2, n.y + n.h / 2 + 1);
        return;
    }
    if (n.sub) {
        // ── 两段卡：彩色头 + 白底体 ──
        const headH = 26;
        rrPath(ctx, n.x, n.y, n.w, n.h, 6);
        ctx.fillStyle = color;
        ctx.fill();
        bottomRoundPath(ctx, n.x, n.y + headH, n.w, n.h - headH, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        // 外描边（头色派生淡色）
        rrPath(ctx, n.x, n.y, n.w, n.h, 6);
        ctx.strokeStyle = (0, theme_1.withAlpha)(color, '80');
        ctx.lineWidth = 1;
        ctx.stroke();
        // 头标题（白字加粗，截断）
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${subFontSize + 1}px ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(fitText(ctx, n.label, n.w - 16), n.x + 8, n.y + headH / 2 + 1);
        // 体文本（delay 行）
        ctx.fillStyle = opts.bodyTextColor;
        ctx.font = `${subFontSize + 1}px ${fontFamily}`;
        ctx.fillText(fitText(ctx, n.sub, n.w - 16), n.x + 8, n.y + headH + (n.h - headH) / 2 + 1);
        return;
    }
    // ── 纯色圆角块 ──
    rrPath(ctx, n.x, n.y, n.w, n.h, 8);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fitText(ctx, n.label, n.w - 16), n.x + n.w / 2, n.y + n.h / 2 + 1);
}
/** 主入口：先边后节点（节点压住箭头根部）。清空由 CanvasLayer 负责。 */
function drawFlow(ctx, nodes, edges, opts) {
    ctx.globalAlpha = Math.max(0, Math.min(1, opts.reveal));
    for (const e of edges)
        drawEdge(ctx, e, opts);
    for (const n of nodes)
        drawNode(ctx, n, opts);
    ctx.globalAlpha = 1;
}
