"use strict";
// Sankey 桑基图布局（分层有向无环图）。纯函数、无渲染关切，便于探针验证。
// 输入节点名 + 链接（source/target 下标 + value 流量），输出：节点值 = max(流入,流出)、按最长路径分列、
// 列内按值堆叠成竖直区间（全局比例 ky 保证同值同厚）、流带在节点两端按序排布给出中心 y 与厚度。
// 约定：x 向右为深度递增；y 向下。交叉最小化用「出边按目标位、入边按源位」单次排序（演示级，未做 d3 迭代松弛）。
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutSankey = layoutSankey;
exports.sankeyRibbon = sankeyRibbon;
/**
 * 计算桑基布局。假定输入为 DAG（有环时按访问序兜底，不死循环）。越界下标忽略。
 */
function layoutSankey(names, inputs, opts) {
    const nodeWidth = opts.nodeWidth ?? 14;
    const nodePadding = opts.nodePadding ?? 12;
    const N = names.length;
    const links = inputs.filter((l) => l.source >= 0 && l.target >= 0 && l.source < N && l.target < N && l.source !== l.target && l.value > 0);
    const nodes = names.map((name, index) => ({ index, name, value: 0, depth: 0, x0: 0, x1: 0, y0: 0, y1: 0 }));
    const outSum = new Array(N).fill(0);
    const inSum = new Array(N).fill(0);
    for (const l of links) {
        outSum[l.source] += l.value;
        inSum[l.target] += l.value;
    }
    for (let i = 0; i < N; i++)
        nodes[i].value = Math.max(outSum[i], inSum[i]);
    // 深度：最长路径（Kahn 拓扑推进，环余节点按访问序兜底）
    const indeg = inSum.map((_, i) => links.filter((l) => l.target === i).length);
    const queue = [];
    for (let i = 0; i < N; i++)
        if (indeg[i] === 0)
            queue.push(i);
    const seen = new Set(queue);
    let qi = 0;
    while (qi < queue.length) {
        const u = queue[qi++];
        for (const l of links) {
            if (l.source !== u)
                continue;
            const v = l.target;
            if (nodes[v].depth < nodes[u].depth + 1)
                nodes[v].depth = nodes[u].depth + 1;
            indeg[v]--;
            if (indeg[v] === 0 && !seen.has(v)) {
                seen.add(v);
                queue.push(v);
            }
        }
    }
    // 环内未访问节点：给个兜底列（源之后一列），避免堆在最左
    for (let i = 0; i < N; i++)
        if (!seen.has(i))
            nodes[i].depth = 1;
    const columns = nodes.reduce((a, n) => Math.max(a, n.depth + 1), 0) || 1;
    // x 按列均布
    const dx = columns > 1 ? (opts.width - nodeWidth) / (columns - 1) : 0;
    for (const n of nodes) {
        n.x0 = n.depth * dx;
        n.x1 = n.x0 + nodeWidth;
    }
    // 全局 ky：取各列中最紧的一列，保证任何列 (Σvalue·ky + 间隙) ≤ height
    let ky = Infinity;
    for (let c = 0; c < columns; c++) {
        const col = nodes.filter((n) => n.depth === c);
        if (col.length === 0)
            continue;
        const sumV = col.reduce((a, n) => a + n.value, 0);
        const avail = opts.height - (col.length - 1) * nodePadding;
        if (sumV > 0)
            ky = Math.min(ky, avail / sumV);
    }
    if (!Number.isFinite(ky) || ky <= 0)
        ky = 0;
    // 列内堆叠（按输入序），整列垂直居中
    for (let c = 0; c < columns; c++) {
        const col = nodes.filter((n) => n.depth === c);
        const totalH = col.reduce((a, n) => a + n.value * ky, 0) + Math.max(0, col.length - 1) * nodePadding;
        let y = (opts.height - totalH) / 2;
        for (const n of col) {
            n.y0 = y;
            n.y1 = y + n.value * ky;
            y = n.y1 + nodePadding;
        }
    }
    // 流带：出边按目标 y0 排序、入边按源 y1 排序，各自在节点内从上往下堆叠取中心
    const outLinks = new Map();
    const inLinks = new Map();
    const asLink = (l) => ({ ...l, width: l.value * ky, y0: 0, y1: 0 });
    const result = links.map(asLink);
    const byKey = new Map();
    result.forEach((rl, i) => {
        byKey.set(links[i], rl);
    });
    for (const l of links) {
        let oa = outLinks.get(l.source);
        if (!oa) {
            oa = [];
            outLinks.set(l.source, oa);
        }
        oa.push(l);
        let ia = inLinks.get(l.target);
        if (!ia) {
            ia = [];
            inLinks.set(l.target, ia);
        }
        ia.push(l);
    }
    const nodeOf = (i) => nodes[i];
    outLinks.forEach((arr, src) => {
        arr.sort((a, b) => nodeOf(a.target).y0 - nodeOf(b.target).y0);
        let off = nodeOf(src).y0;
        for (const l of arr) {
            const rl = byKey.get(l);
            rl.width = l.value * ky;
            rl.y0 = off + rl.width / 2;
            off += rl.width;
        }
    });
    inLinks.forEach((arr, tgt) => {
        arr.sort((a, b) => nodeOf(a.source).y1 - nodeOf(b.source).y1);
        let off = nodeOf(tgt).y0;
        for (const l of arr) {
            const rl = byKey.get(l);
            rl.y1 = off + (l.value * ky) / 2;
            off += l.value * ky;
        }
    });
    return { nodes, links: result, columns, ky };
}
/** 生成一条水平三次贝塞尔缎带 path（源右侧 (sx,y0) → 目标左侧 (tx,y1)，带宽 w 的填充带）。 */
function sankeyRibbon(sx, sy, tx, ty, w) {
    const c = (sx + tx) / 2;
    const h = w / 2;
    return (`M ${sx.toFixed(2)} ${(sy - h).toFixed(2)} ` +
        `C ${c.toFixed(2)} ${(sy - h).toFixed(2)} ${c.toFixed(2)} ${(ty - h).toFixed(2)} ${tx.toFixed(2)} ${(ty - h).toFixed(2)} ` +
        `L ${tx.toFixed(2)} ${(ty + h).toFixed(2)} ` +
        `C ${c.toFixed(2)} ${(ty + h).toFixed(2)} ${c.toFixed(2)} ${(sy + h).toFixed(2)} ${sx.toFixed(2)} ${(sy + h).toFixed(2)} Z`);
}
