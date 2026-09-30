"use strict";
// 几何原语：极坐标 / SVG path 生成（扇环、圆弧描边、多边形、折线）+ 折线定长截断（入场揭示）。
// path 交 Icon 的 raw path 层光栅化——仅限方形画布（painter 按 min(w,h) 等比缩放居中），
// 故 Pie/Radar/Gauge 用 path；线/面/柱这类矩形绘图用 View 拼段（见各图）。
Object.defineProperty(exports, "__esModule", { value: true });
exports.polar = polar;
exports.sectorPath = sectorPath;
exports.arcPath = arcPath;
exports.polygonPath = polygonPath;
exports.polylineLength = polylineLength;
exports.catmullRom = catmullRom;
exports.truncatePolyline = truncatePolyline;
exports.sectorHitBoxes = sectorHitBoxes;
exports.sampleYAtX = sampleYAtX;
const f = (n) => n.toFixed(2);
/** 极坐标：deg 以 12 点为 0，顺时针增长。 */
function polar(cx, cy, r, deg) {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
/** 实心 / 环形扇区（fill）：从 a0 顺时针扫 sweep；r0<=0 为实心饼块。 */
function sectorPath(cx, cy, r0, r1, a0, sweep) {
    const s = Math.min(sweep, 359.99);
    if (s <= 0.01)
        return '';
    const a1 = a0 + s;
    const large = s > 180 ? 1 : 0;
    const [x0, y0] = polar(cx, cy, r1, a0);
    const [x1, y1] = polar(cx, cy, r1, a1);
    if (r0 <= 0.01) {
        return `M ${f(cx)} ${f(cy)} L ${f(x0)} ${f(y0)} A ${f(r1)} ${f(r1)} 0 ${large} 1 ${f(x1)} ${f(y1)} Z`;
    }
    const [ix1, iy1] = polar(cx, cy, r0, a1);
    const [ix0, iy0] = polar(cx, cy, r0, a0);
    return (`M ${f(x0)} ${f(y0)} A ${f(r1)} ${f(r1)} 0 ${large} 1 ${f(x1)} ${f(y1)} ` +
        `L ${f(ix1)} ${f(iy1)} A ${f(r0)} ${f(r0)} 0 ${large} 0 ${f(ix0)} ${f(iy0)} Z`);
}
/** 圆弧描边（stroke）：从 startDeg 顺时针扫 sweepDeg；sweep<=0 返回空串。 */
function arcPath(cx, cy, r, startDeg, sweepDeg) {
    if (sweepDeg <= 0.01)
        return '';
    const s = Math.min(sweepDeg, 359.99);
    const [sx, sy] = polar(cx, cy, r, startDeg);
    const [ex, ey] = polar(cx, cy, r, startDeg + s);
    const large = s > 180 ? 1 : 0;
    return `M ${f(sx)} ${f(sy)} A ${f(r)} ${f(r)} 0 ${large} 1 ${f(ex)} ${f(ey)}`;
}
/** 闭合多边形路径（radar 面）：点序列首尾相连。 */
function polygonPath(pts) {
    if (pts.length === 0)
        return '';
    return pts.map((p, i) => `${i ? 'L' : 'M'} ${f(p[0])} ${f(p[1])}`).join(' ') + ' Z';
}
/** 折线总长。 */
function polylineLength(pts) {
    let total = 0;
    for (let i = 1; i < pts.length; i++)
        total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return total;
}
/**
 * Catmull-Rom 平滑：把折线点列稠密化成过每个原点的光滑曲线（供 Segments / 面积薄片采样）。
 * <3 点无从弯曲，原样返回。samples 为每段采样数（越大越平滑、View 越多）。端点用「复制首/末点」补邻。
 * 注：均匀 Catmull-Rom 在剧烈起伏处可能轻微过冲（本管线无 monotone 约束），常规数据无碍。
 */
function catmullRom(pts, samples = 12) {
    if (pts.length < 3)
        return pts.slice();
    const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = at(i - 1);
        const p1 = at(i);
        const p2 = at(i + 1);
        const p3 = at(i + 2);
        for (let s = 0; s < samples; s++) {
            const t = s / samples;
            const t2 = t * t;
            const t3 = t2 * t;
            const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
            const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
            out.push([x, y]);
        }
    }
    out.push(pts[pts.length - 1]);
    return out;
}
/**
 * 按总长比例 t（0..1）截断折线——入场「自左向右描线」的核心。
 * 返回截断后的点列，末段按比例插入插值点。
 */
function truncatePolyline(pts, t) {
    if (pts.length === 0)
        return [];
    if (t >= 1)
        return pts.slice();
    if (t <= 0)
        return [pts[0]];
    const segL = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
        const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        segL.push(L);
        total += L;
    }
    let target = total * t;
    const out = [pts[0]];
    for (let i = 0; i < segL.length; i++) {
        if (target >= segL[i]) {
            out.push(pts[i + 1]);
            target -= segL[i];
        }
        else {
            const a = pts[i];
            const b = pts[i + 1];
            const r = segL[i] ? target / segL[i] : 0;
            out.push([a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r]);
            break;
        }
    }
    return out;
}
/**
 * 扇区命中盒：把 [a0, a0+sweep]×[r0, r1] 的扇环按角度细分成若干小梯形，各取内接轴对齐矩形。
 * 管线 hover 命中只认矩形（无 path 命中测试），直接用整块扇区包围盒会越界误伤邻扇区；
 * 逐段细分后矩形都落在扇区内，精度随 steps 提高（3° 一格足够细腻）。返回 {left,top,width,height} 列表。
 */
function sectorHitBoxes(cx, cy, r0, r1, a0, sweep, steps = 24) {
    const out = [];
    const span = Math.min(sweep, 359.99);
    if (span <= 0.01 || r1 <= 0)
        return out;
    const n = Math.max(2, Math.min(steps, Math.ceil(span / 3)));
    const dt = span / n;
    const box = (l, t, w, h) => {
        if (w > 0.5 && h > 0.5)
            out.push({ left: l, top: t, width: w, height: h });
    };
    if (r0 <= 0.01) {
        // 实心饼：首格覆盖圆周到 dt/2 的中轴条带（起顶点在圆心，半径取到 r1 全宽）
        const m1 = polar(cx, cy, r1, a0 + dt / 2);
        box(Math.min(cx, m1[0]), Math.min(cy, m1[1]), Math.abs(m1[0] - cx), Math.abs(m1[1] - cy));
    }
    // 环带逐段：小梯形 [a0+i*dt, +dt]×[r0', r1] 的内接矩形（角点极值收缩 dt/4 安全边距）
    for (let i = r0 <= 0.01 ? 1 : 0; i < n; i++) {
        const t0 = a0 + i * dt + Math.min(dt / 4, 1);
        const t1 = a0 + (i + 1) * dt - Math.min(dt / 4, 1);
        if (t1 <= t0)
            continue;
        // 内半径逐段外推：起点段内侧只到「中轴与 a0 边交点」附近，用比例抬升避免侵入邻扇区
        const k0 = r0 <= 0.01 ? (r1 * dt) / 4 : r0;
        const xs = [polar(cx, cy, k0, t0)[0], polar(cx, cy, r1, t0)[0], polar(cx, cy, k0, t1)[0], polar(cx, cy, r1, t1)[0]];
        const ys = [polar(cx, cy, k0, t0)[1], polar(cx, cy, r1, t0)[1], polar(cx, cy, k0, t1)[1], polar(cx, cy, r1, t1)[1]];
        const l = Math.min(...xs);
        const tp = Math.min(...ys);
        box(l, tp, Math.max(...xs) - l, Math.max(...ys) - tp);
    }
    return out;
}
/** 在点列上按 x 线性插值取 y（面积填充沿 x 采样用）；pts 已按 x 升序。 */
function sampleYAtX(pts, x) {
    if (pts.length === 0)
        return null;
    if (x <= pts[0][0])
        return pts[0][1];
    const last = pts[pts.length - 1];
    if (x >= last[0])
        return last[1];
    for (let i = 1; i < pts.length; i++) {
        if (pts[i][0] >= x) {
            const a = pts[i - 1];
            const b = pts[i];
            const r = b[0] - a[0] ? (x - a[0]) / (b[0] - a[0]) : 0;
            return a[1] + (b[1] - a[1]) * r;
        }
    }
    return last[1];
}
