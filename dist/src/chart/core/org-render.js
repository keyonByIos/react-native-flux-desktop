"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawOrg = drawOrg;
/** 圆角矩形路径（arcTo，兼容 @napi-rs/canvas）。 */
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
/** 彩色顶条厚度（两方向都画在卡顶边，对齐 AntV 原图）。 */
const BAR = 3;
/** 沿圆角卡顶边裁一条彩色横条。 */
function topBarPath(ctx, x, y, w, h, r) {
    ctx.save();
    rrPath(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.beginPath();
    ctx.rect(x, y, w, BAR);
    ctx.fill();
    ctx.restore();
}
/** 超宽截断加省略号。 */
function clip(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW)
        return text;
    let s = text;
    while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW)
        s = s.slice(0, -1);
    return `${s}…`;
}
/** 锚点小圆半径（card 模式有子节点时出口处）。 */
const ANCHOR_R = 3.5;
/** 箭头半长/半宽（card 模式子节点入口处）。 */
const ARROW_L = 6;
const ARROW_W = 3.5;
function drawEdge(ctx, e, opts) {
    const p = e.from;
    const c = e.to;
    const card = opts.nodeStyle === 'card';
    const outOff = card ? ANCHOR_R + 1.5 : 0;
    const inOff = card ? ARROW_L : 0;
    ctx.beginPath();
    ctx.strokeStyle = opts.nodeStyle === 'simple' ? opts.edgeColor : opts.primary;
    ctx.lineWidth = opts.lineWidth;
    if (opts.direction === 'vertical') {
        const py = p.y + p.h + outOff;
        const cy = c.y - inOff;
        const busY = (py + cy) / 2;
        ctx.moveTo(p.cx, py);
        ctx.lineTo(p.cx, busY);
        ctx.lineTo(c.cx, busY);
        ctx.lineTo(c.cx, cy);
        ctx.stroke();
        if (card)
            arrow(ctx, c.cx, c.y, 'down', opts.primary);
    }
    else {
        const px = p.x + p.w + outOff;
        const cx = c.x - inOff;
        const busX = (px + cx) / 2;
        ctx.moveTo(px, p.cy);
        ctx.lineTo(busX, p.cy);
        ctx.lineTo(busX, c.cy);
        ctx.lineTo(cx, c.cy);
        ctx.stroke();
        if (card)
            arrow(ctx, c.x, c.cy, 'right', opts.primary);
    }
}
function arrow(ctx, tipX, tipY, dir, color) {
    ctx.beginPath();
    if (dir === 'down') {
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - ARROW_W, tipY - ARROW_L);
        ctx.lineTo(tipX + ARROW_W, tipY - ARROW_L);
    }
    else {
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - ARROW_L, tipY - ARROW_W);
        ctx.lineTo(tipX - ARROW_L, tipY + ARROW_W);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}
function anchor(ctx, b, opts) {
    const ax = opts.direction === 'vertical' ? b.cx : b.x + b.w + ANCHOR_R + 1;
    const ay = opts.direction === 'vertical' ? b.y + b.h + ANCHOR_R + 1 : b.cy;
    ctx.beginPath();
    ctx.arc(ax, ay, ANCHOR_R, 0, Math.PI * 2);
    ctx.fillStyle = opts.cardBg;
    ctx.fill();
    ctx.strokeStyle = opts.primary;
    ctx.lineWidth = 1.2;
    ctx.stroke();
}
function drawCard(ctx, b, opts) {
    const { fontFamily, nameFont, subFont } = opts;
    const color = b.color ?? opts.primary;
    // 卡底 + 描边
    rrPath(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fillStyle = opts.cardBg;
    ctx.fill();
    ctx.strokeStyle = opts.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
    // 彩色顶条
    ctx.fillStyle = color;
    topBarPath(ctx, b.x, b.y, b.w, b.h, 5);
    // 头像圆 + 首字母
    const av = Math.min(b.h - 14, 20);
    const acx = b.x + 8 + av / 2;
    const acy = b.cy + 1;
    ctx.beginPath();
    ctx.arc(acx, acy, av / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${Math.round(av * 0.55)}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((b.label[0] ?? '').toUpperCase(), acx, acy + 0.5);
    // 姓名 + 职务两行，超宽截断
    const tx = acx + av / 2 + 6;
    const maxW = b.x + b.w - 6 - tx;
    ctx.textAlign = 'left';
    ctx.fillStyle = opts.nameColor;
    ctx.font = `600 ${nameFont}px ${fontFamily}`;
    ctx.fillText(clip(ctx, b.label, maxW), tx, b.cy - (b.sub ? subFont * 0.75 : 0));
    if (b.sub) {
        ctx.fillStyle = opts.subColor;
        ctx.font = `${subFont}px ${fontFamily}`;
        ctx.fillText(clip(ctx, b.sub, maxW), tx, b.cy + nameFont * 0.75);
    }
}
function drawNode(ctx, b, opts) {
    if (opts.nodeStyle === 'card') {
        drawCard(ctx, b, opts);
        if (b.hasChildren)
            anchor(ctx, b, opts);
        return;
    }
    rrPath(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fillStyle = opts.primary;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `${opts.fontSize}px ${opts.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, b.cx, b.cy + 1);
}
/** 主入口：先边后节点。清空由 CanvasLayer 负责。 */
function drawOrg(ctx, boxes, edges, opts) {
    ctx.globalAlpha = Math.max(0, Math.min(1, opts.reveal));
    for (const e of edges)
        drawEdge(ctx, e, opts);
    for (const b of boxes)
        drawNode(ctx, b, opts);
    ctx.globalAlpha = 1;
}
