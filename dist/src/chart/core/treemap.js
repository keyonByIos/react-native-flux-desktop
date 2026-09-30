"use strict";
// squarify 矩形树图布局（Bruls, Huizing, van Wijk 2000）。纯函数、无渲染关切，便于探针验证。
// 输入一组正权重值 + 目标盒 (x,y,w,h)，输出每个值对应的矩形：面积∝值、长宽比尽量接近 1。
// 算法：值降序，沿剩余盒的短边贪心成「行」——每加入一个元素若使行内最差长宽比变差则另起一行。
Object.defineProperty(exports, "__esModule", { value: true });
exports.squarify = squarify;
/** 一行（rowArea=行总面积，areas=各元素面积）沿长度 side 排布时的最差长宽比。 */
function worstAspect(rowArea, areas, side) {
    let rmax = 0;
    let rmin = Infinity;
    for (const a of areas) {
        if (a > rmax)
            rmax = a;
        if (a < rmin)
            rmin = a;
    }
    if (rowArea <= 0 || rmin <= 0)
        return Infinity;
    const s2 = side * side;
    const area2 = rowArea * rowArea;
    return Math.max((s2 * rmax) / area2, area2 / (s2 * rmin));
}
/**
 * 把 values（正权重）铺进盒 (x,y,w,h)，返回等长矩形数组（0/负值项被跳过，不出现在结果里）。
 * 结果面积 ∝ 值；总面积 = 盒面积（无空隙）。
 */
function squarify(values, x, y, w, h) {
    const out = [];
    const positive = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
    const total = positive.reduce((a, b) => a + b, 0);
    if (total <= 0 || w <= 0 || h <= 0)
        return out;
    const items = positive
        .map((v, i) => ({ v, i }))
        .filter((d) => d.v > 0)
        .sort((a, b) => b.v - a.v);
    const scale = (w * h) / total; // 值 → 面积（px²）
    let bx = x;
    let by = y;
    let bw = w;
    let bh = h;
    let idx = 0;
    while (idx < items.length) {
        const side = Math.min(bw, bh); // 沿短边排行
        const row = [];
        const rowAreas = [];
        let rowArea = 0;
        let rowWorst = Infinity;
        // 贪心：只要「加入后最差比不升」就续行；首元素无条件入行
        while (idx < items.length) {
            const a = items[idx].v * scale;
            const testAreas = rowAreas.concat([a]);
            const testArea = rowArea + a;
            const worst = worstAspect(testArea, testAreas, side);
            if (row.length === 0 || worst <= rowWorst) {
                row.push(items[idx]);
                rowAreas.push(a);
                rowArea = testArea;
                rowWorst = worst;
                idx++;
            }
            else {
                break;
            }
        }
        // 排布本行：条带厚度 = 行面积 / 短边长；各元素沿短边按面积/厚度取长
        const thick = rowArea / side;
        let offset = 0;
        for (let k = 0; k < row.length; k++) {
            const cellLong = rowAreas[k] / thick;
            if (bw >= bh) {
                // 剩余盒宽≥高：条带贴左侧，竖向铺
                out.push({ x: bx, y: by + offset, w: thick, h: cellLong, index: row[k].i });
            }
            else {
                out.push({ x: bx + offset, y: by, w: cellLong, h: thick, index: row[k].i });
            }
            offset += cellLong;
        }
        if (bw >= bh) {
            bx += thick;
            bw -= thick;
        }
        else {
            by += thick;
            bh -= thick;
        }
    }
    return out;
}
