"use strict";
// 树图布局公共层：Dendrogram（生态树，叶对齐）与 CompactBox（紧凑树，叶可错层）。
// 两算法都在「抽象空间」算出 (depth, cross)——depth 沿树边、cross 是叶序槽位；再由 toXY 依
// direction 映射到笛卡尔 (x, y) 或极坐标。这样同一份数据可在 6 种视图（2 算法 × 3 方向）下
// 复用同一套节点/边拓扑，差异只在投影与贝塞尔控制点。
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutDendrogram = layoutDendrogram;
exports.layoutCompactBox = layoutCompactBox;
exports.toXY = toXY;
exports.buildEdges = buildEdges;
/** 规范化：补 id、构 children 视图。返回带内部 id 的克隆树。 */
function normalize(root) {
    let seq = 0;
    const walk = (n, parentId) => {
        const id = n.id ?? `n${++seq}`;
        const label = n.label ?? id;
        const children = (n.children ?? []).map((c) => walk(c, id));
        return { id, label, children, parentId, isLeaf: children.length === 0 };
    };
    return { node: walk(root, null), count: seq };
}
/** 子树高度（到最远叶的边数）。叶 = 0。 */
function heightOf(n) {
    if (n.children.length === 0)
        return 0;
    let h = 0;
    for (const c of n.children)
        h = Math.max(h, heightOf(c));
    return h + 1;
}
/** 子树叶数（用于 cross 槽位分配）。 */
function leafCountOf(n) {
    if (n.children.length === 0)
        return 1;
    let s = 0;
    for (const c of n.children)
        s += leafCountOf(c);
    return s;
}
/**
 * 分配 cross 槽位：叶按 DFS 序依次占 0,1,2,...；父 = (首子 + 末子) / 2。
 * 两算法共用——差异只在 depth 计算。
 */
function assignCross(root) {
    const out = new Map();
    let cursor = 0;
    const walk = (n) => {
        if (n.children.length === 0) {
            const c = cursor++;
            out.set(n.id, c);
            return c;
        }
        let first = 0;
        let last = 0;
        n.children.forEach((c, i) => {
            const v = walk(c);
            if (i === 0)
                first = v;
            if (i === n.children.length - 1)
                last = v;
        });
        const mid = (first + last) / 2;
        out.set(n.id, mid);
        return mid;
    };
    walk(root);
    return out;
}
/**
 * Dendrogram（生态树）：所有叶在同一 depth = maxDepth；非叶 depth = maxDepth - height(node)。
 * 短枝被"拉伸"到与长枝同层，视觉上叶排成一条直线（水平/垂直）或同一圆周（径向）。
 */
function layoutDendrogram(root) {
    const { node } = normalize(root);
    const maxDepth = heightOf(node);
    const crossMap = assignCross(node);
    const out = [];
    const walk = (n, depth) => {
        out.push({
            id: n.id,
            label: n.label,
            depth,
            cross: crossMap.get(n.id) ?? 0,
            parentId: n.parentId,
            isLeaf: n.isLeaf,
        });
        for (const c of n.children)
            walk(c, depth - 1);
    };
    walk(node, maxDepth);
    // 上面 walk 从根 depth=maxDepth 起、往子递减；实际主轴要根=0，叶=maxDepth，翻转
    for (const p of out)
        p.depth = maxDepth - p.depth;
    return { positions: out, leafCount: leafCountOf(node), maxDepth };
}
/**
 * CompactBox（紧凑树）：depth = 自然树深（根 0，逐层 +1）；叶可在不同 depth。
 * 相同 cross 分配规则；因叶不必同层，视觉上更紧凑，父节点常与部分子节点同高。
 */
function layoutCompactBox(root) {
    const { node } = normalize(root);
    const maxDepth = heightOf(node);
    const crossMap = assignCross(node);
    const out = [];
    const walk = (n, depth) => {
        out.push({
            id: n.id,
            label: n.label,
            depth,
            cross: crossMap.get(n.id) ?? 0,
            parentId: n.parentId,
            isLeaf: n.isLeaf,
        });
        for (const c of n.children)
            walk(c, depth + 1);
    };
    walk(node, 0);
    return { positions: out, leafCount: leafCountOf(node), maxDepth };
}
/** 把抽象 (depth, cross) 投到画布坐标。 */
function toXY(positions, leafCount, maxDepth, opts) {
    const { direction, width, height, paddingMain, paddingCross, innerRadius } = opts;
    const spanDepth = Math.max(1, maxDepth);
    const spanCross = Math.max(1, leafCount - 1);
    if (direction === 'horizontal') {
        const xStep = (width - 2 * paddingMain) / spanDepth;
        const yStep = leafCount <= 1 ? 0 : (height - 2 * paddingCross) / spanCross;
        const yMid = height / 2;
        return positions.map((p) => ({
            id: p.id, label: p.label, isLeaf: p.isLeaf, parentId: p.parentId,
            x: paddingMain + p.depth * xStep,
            y: yMid + (p.cross - spanCross / 2) * yStep,
        }));
    }
    if (direction === 'vertical') {
        const yStep = (height - 2 * paddingMain) / spanDepth;
        const xStep = leafCount <= 1 ? 0 : (width - 2 * paddingCross) / spanCross;
        const xMid = width / 2;
        return positions.map((p) => ({
            id: p.id, label: p.label, isLeaf: p.isLeaf, parentId: p.parentId,
            x: xMid + (p.cross - spanCross / 2) * xStep,
            y: paddingMain + p.depth * yStep,
        }));
    }
    // radial：cross → 角度（0 = 12 点，顺时针）；depth → 半径
    const cx = width / 2;
    const cy = height / 2;
    const rMax = Math.min(width, height) / 2 - Math.max(paddingMain, 8);
    const rStep = (rMax - innerRadius) / spanDepth;
    const angleStep = leafCount <= 1 ? 0 : (Math.PI * 2) / leafCount;
    return positions.map((p) => {
        const angle = p.cross * angleStep - Math.PI / 2 + angleStep / 2; // 让首叶从 12 点稍偏
        const radius = innerRadius + p.depth * rStep;
        return {
            id: p.id, label: p.label, isLeaf: p.isLeaf, parentId: p.parentId,
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
            angle,
            radius,
        };
    });
}
/** 由 positions 构边表（用 point id 索引）。 */
function buildEdges(points) {
    const byId = new Map();
    for (const p of points)
        byId.set(p.id, p);
    const out = [];
    for (const p of points) {
        if (p.parentId == null)
            continue;
        const from = byId.get(p.parentId);
        if (from)
            out.push({ from, to: p });
    }
    return out;
}
