"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawMindMap = drawMindMap;
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
/** 节点所属分支色（filled 恒主色；line/box 取色板）。 */
function colorOf(opts, branch) {
    if (opts.nodeStyle === 'filled')
        return opts.primary;
    return opts.palette[((branch % opts.palette.length) + opts.palette.length) % opts.palette.length];
}
function drawEdge(ctx, e, opts) {
    const p = e.from;
    const c = e.to;
    // 连线从父节点靠子侧的边缘中点出发，进子节点靠父侧的边缘中点；S 形贝塞尔
    const x1 = c.dir === 1 ? p.x + p.w : p.x;
    const x2 = c.dir === 1 ? c.x : c.x + c.w;
    const mx = (x1 + x2) / 2;
    ctx.beginPath();
    ctx.moveTo(x1, p.cy);
    ctx.bezierCurveTo(mx, p.cy, mx, c.cy, x2, c.cy);
    ctx.strokeStyle = opts.nodeStyle === 'filled' ? opts.edgeColor : colorOf(opts, c.branch);
    ctx.lineWidth = opts.lineWidth;
    ctx.stroke();
}
function drawNode(ctx, b, opts) {
    const { nodeStyle, fontFamily, fontSize } = opts;
    const isRoot = b.depth === 0;
    const color = colorOf(opts, b.branch);
    const bold = isRoot || nodeStyle === 'filled' && b.depth === 1;
    ctx.font = `${bold ? '600 ' : ''}${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (nodeStyle === 'line') {
        if (isRoot) {
            // 根：灰底盒 + 深色加粗字
            rrPath(ctx, b.x, b.y, b.w, b.h, 4);
            ctx.fillStyle = opts.rootBg;
            ctx.fill();
            ctx.fillStyle = opts.rootText;
            ctx.fillText(b.label, b.cx, b.cy + 1);
            return;
        }
        ctx.fillStyle = color;
        ctx.fillText(b.label, b.cx, b.cy + 1);
        if (!b.hasChildren) {
            // 叶节点：文字下方一条分支色下划线（AntV line 风格）
            const uy = b.y + b.h + 2;
            ctx.beginPath();
            ctx.moveTo(b.x + opts.padX * 0.4, uy);
            ctx.lineTo(b.x + b.w - opts.padX * 0.4, uy);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        return;
    }
    if (nodeStyle === 'box') {
        if (isRoot) {
            rrPath(ctx, b.x, b.y, b.w, b.h, 4);
            ctx.fillStyle = opts.rootBg;
            ctx.fill();
            ctx.fillStyle = opts.rootText;
            ctx.fillText(b.label, b.cx, b.cy + 1);
            return;
        }
        rrPath(ctx, b.x, b.y, b.w, b.h, 5);
        if (b.depth === 1) {
            // 一级分支：实色填充白字
            ctx.fillStyle = color;
            ctx.fill();
            ctx.fillStyle = '#ffffff';
        }
        else {
            // 更深层：白底描边 + 分支色字
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.fillStyle = color;
        }
        ctx.fillText(b.label, b.cx, b.cy + 1);
        return;
    }
    // filled：所有节点主色圆角块 + 白字
    rrPath(ctx, b.x, b.y, b.w, b.h, 4);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(b.label, b.cx, b.cy + 1);
}
/** 主入口：先边后节点。清空由 CanvasLayer 负责。 */
function drawMindMap(ctx, boxes, edges, opts) {
    ctx.globalAlpha = Math.max(0, Math.min(1, opts.reveal));
    for (const e of edges)
        drawEdge(ctx, e, opts);
    for (const b of boxes)
        drawNode(ctx, b, opts);
    ctx.globalAlpha = 1;
}
