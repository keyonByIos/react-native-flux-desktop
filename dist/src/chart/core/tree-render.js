"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawTree = drawTree;
/** 画一条父子边。径向用两段（父角→中间角→子角）近似弧线；主轴用 cubic bezier。 */
function strokeEdge(ctx, e, direction) {
    const { from, to } = e;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    if (direction === 'horizontal') {
        const mx = (from.x + to.x) / 2;
        ctx.bezierCurveTo(mx, from.y, mx, to.y, to.x, to.y);
    }
    else if (direction === 'vertical') {
        const my = (from.y + to.y) / 2;
        ctx.bezierCurveTo(from.x, my, to.x, my, to.x, to.y);
    }
    else {
        // radial：以父半径外推至子半径，两端分别沿父/子角画弧 + 一段过渡
        const r1 = from.radius ?? 0;
        const r2 = to.radius ?? 0;
        const a1 = from.angle ?? 0;
        const a2 = to.angle ?? 0;
        const midR = (r1 + r2) / 2;
        const p1x = Math.cos(a1) * midR + (to.x - Math.cos(a2) * midR) * 0;
        // 简化：直接三段——(from → 父角×midR) → (父角×midR → 子角×midR 弧) → (子角×midR → to)
        const ax = Math.cos(a1) * midR + (from.x - Math.cos(a1) * r1);
        const ay = Math.sin(a1) * midR + (from.y - Math.sin(a1) * r1);
        const bx = Math.cos(a2) * midR + (to.x - Math.cos(a2) * r2);
        const by = Math.sin(a2) * midR + (to.y - Math.sin(a2) * r2);
        ctx.bezierCurveTo(ax, ay, bx, by, to.x, to.y);
        void p1x;
    }
    ctx.stroke();
}
/** 画节点圆。 */
function fillNode(ctx, p, r, color) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}
/** 画标签：三方向摆放规则不同。 */
function drawLabel(ctx, p, opts) {
    const { direction, nodeRadius, labelColor, fontSize, fontFamily } = opts;
    ctx.fillStyle = labelColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';
    if (direction === 'horizontal') {
        if (p.isLeaf) {
            ctx.textAlign = 'left';
            ctx.fillText(p.label, p.x + nodeRadius + 6, p.y);
        }
        else {
            ctx.textAlign = 'right';
            ctx.fillText(p.label, p.x - nodeRadius - 6, p.y);
        }
        return;
    }
    if (direction === 'vertical') {
        if (p.isLeaf) {
            // 叶标签竖排（旋转 -90°），从节点下方起
            ctx.save();
            ctx.translate(p.x, p.y + nodeRadius + 6);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.label, 0, 0);
            ctx.restore();
        }
        else {
            ctx.textAlign = 'left';
            ctx.fillText(p.label, p.x + nodeRadius + 6, p.y);
        }
        return;
    }
    // radial：沿角度切向排布；左半圆翻转 180° 保持文字可读
    const a = p.angle ?? 0;
    const cos = Math.cos(a);
    const isRight = cos >= 0;
    ctx.save();
    ctx.translate(p.x, p.y);
    const rot = isRight ? a : a + Math.PI;
    ctx.rotate(rot);
    ctx.textBaseline = 'middle';
    if (isRight) {
        ctx.textAlign = 'left';
        ctx.fillText(p.label, nodeRadius + 6, 0);
    }
    else {
        ctx.textAlign = 'right';
        ctx.fillText(p.label, -(nodeRadius + 6), 0);
    }
    ctx.restore();
}
/** 主入口：清空由外层 CanvasLayer 负责，本函数只画内容。 */
function drawTree(ctx, points, edges, opts) {
    const { nodeRadius, nodeColor, edgeColor, edgeWidth, reveal } = opts;
    let maxDepth = 0;
    // TreePoint 无 depth 字段；按 edges 拓扑从根 BFS 计算
    const depthOf = new Map();
    const roots = points.filter((p) => p.parentId == null);
    const queue = roots.slice();
    for (const r of queue)
        depthOf.set(r.id, 0);
    while (queue.length > 0) {
        const cur = queue.shift();
        const d = (depthOf.get(cur.id) ?? 0) + 1;
        for (const p of points) {
            if (p.parentId === cur.id && !depthOf.has(p.id)) {
                depthOf.set(p.id, d);
                queue.push(p);
            }
        }
    }
    for (const d of depthOf.values())
        if (d > maxDepth)
            maxDepth = d;
    const cutoff = maxDepth * Math.max(0, Math.min(1, reveal)) + 1e-6;
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = edgeWidth;
    ctx.lineCap = 'round';
    for (const e of edges) {
        const d = depthOf.get(e.to.id) ?? 0;
        if (d > cutoff)
            continue;
        strokeEdge(ctx, e, opts.direction);
    }
    for (const p of points) {
        const d = depthOf.get(p.id) ?? 0;
        if (d > cutoff)
            continue;
        fillNode(ctx, p, nodeRadius, nodeColor);
    }
    for (const p of points) {
        const d = depthOf.get(p.id) ?? 0;
        if (d > cutoff)
            continue;
        drawLabel(ctx, p, opts);
    }
}
