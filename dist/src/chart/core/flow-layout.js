"use strict";
// 流程图布局层：分层（Sugiyama 风格）DAG 布局。
// 三步：① 最长路径定层（layer = 从源点出发的最大深度）；② 每层内按前驱重心排序减交叉；
// ③ 把逻辑层/序映射到画布笛卡尔坐标（x 随层递增、y 在层内堆叠并整体垂直居中）。
// 另提供 chainOf：给定选中节点，求其「所在链路」——全部上游祖先 ∪ 全部下游后代 + 途经边，
// 供「高亮元素及其所在链路」交互（点击任一节点 → 着色该节点的群流程）。
Object.defineProperty(exports, "__esModule", { value: true });
exports.edgeKey = edgeKey;
exports.layoutFlow = layoutFlow;
exports.chainOf = chainOf;
function edgeKey(source, target) {
    return source + '\u0000' + target;
}
/**
 * 分层 DAG 布局：返回带几何的节点框与边。
 * 源点（入度 0）落在第 0 层；其余节点 layer = max(前驱 layer) + 1（最长路径分层）。
 */
function layoutFlow(graph, opts) {
    const { width, height, nodeH = 44, nodeH2 = 62, nodeW = 170, gapX = 90, gapY = 28, padding = 40, } = opts;
    const nodes = graph.nodes;
    const edges = graph.edges;
    const idSet = new Set(nodes.map((n) => n.id));
    // 邻接表（仅保留两端都存在的边）
    const outAdj = new Map();
    const inAdj = new Map();
    for (const n of nodes) {
        outAdj.set(n.id, []);
        inAdj.set(n.id, []);
    }
    const validEdges = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));
    for (const e of validEdges) {
        outAdj.get(e.source).push(e.target);
        inAdj.get(e.target).push(e.source);
    }
    // ① 最长路径分层：layer(v) = 0（若无入边）否则 max(layer(u))+1。
    //   拓扑序松弛；对环做兜底（visited 上限），demo 数据均为 DAG。
    const layer = new Map();
    for (const n of nodes)
        layer.set(n.id, 0);
    const indeg = new Map();
    for (const n of nodes)
        indeg.set(n.id, inAdj.get(n.id).length);
    const queue = nodes.filter((n) => indeg.get(n.id) === 0).map((n) => n.id);
    let guard = nodes.length * nodes.length + 16;
    const processed = new Set();
    while (queue.length && guard-- > 0) {
        const u = queue.shift();
        if (processed.has(u))
            continue;
        processed.add(u);
        for (const v of outAdj.get(u)) {
            layer.set(v, Math.max(layer.get(v), layer.get(u) + 1));
            indeg.set(v, indeg.get(v) - 1);
            if (indeg.get(v) <= 0)
                queue.push(v);
        }
    }
    // 环中未处理节点：按已有 layer 值保留（不崩）。
    // 分桶到各层
    const maxLayer = Math.max(0, ...[...layer.values()]);
    const layers = Array.from({ length: maxLayer + 1 }, () => []);
    for (const n of nodes)
        layers[layer.get(n.id)].push(n.id);
    // ② 重心排序：按各节点前驱在上层的平均下标排序，减少交叉（单遍即可满足 demo 规模）。
    const orderBy = new Map();
    for (const id of layers[0])
        orderBy.set(id, orderBy.size);
    for (let l = 1; l <= maxLayer; l++) {
        const scored = layers[l].map((id, idx) => {
            const preds = inAdj.get(id);
            let sum = 0;
            let cnt = 0;
            for (const p of preds) {
                const o = orderBy.get(p);
                if (o != null) {
                    sum += o;
                    cnt++;
                }
            }
            return { id, bary: cnt > 0 ? sum / cnt : idx };
        });
        scored.sort((a, b) => a.bary - b.bary);
        layers[l] = scored.map((s) => s.id);
        for (const id of layers[l])
            orderBy.set(id, orderBy.size);
    }
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const heightOf = (id) => (nodeById.get(id).sub ? nodeH2 : nodeH);
    // ③ 映射到画布坐标。
    const usableW = width - padding * 2;
    // 列间距（含节点宽）：若总宽超出可用宽，压缩 colSpan（保底 nodeW+8 的微间隙）
    let colSpan = nodeW + gapX;
    if (maxLayer > 0 && maxLayer * colSpan + nodeW > usableW) {
        colSpan = Math.max(nodeW + 8, (usableW - nodeW) / maxLayer);
    }
    // 整体水平居中
    const totalW = maxLayer * colSpan + nodeW;
    const startX = padding + Math.max(0, (usableW - totalW) / 2);
    const boxes = [];
    const byId = new Map();
    for (let l = 0; l <= maxLayer; l++) {
        const ids = layers[l];
        const colH = ids.reduce((s, id) => s + heightOf(id), 0) + Math.max(0, ids.length - 1) * gapY;
        let y = padding + Math.max(0, (height - padding * 2 - colH) / 2);
        const x = startX + l * colSpan;
        for (const id of ids) {
            const nd = nodeById.get(id);
            const h = heightOf(id);
            const box = {
                id, label: nd.label, sub: nd.sub, color: nd.color,
                x, y, w: nodeW, h, layer: l,
            };
            boxes.push(box);
            byId.set(id, box);
            y += h + gapY;
        }
    }
    const edgeBoxes = [];
    for (const e of validEdges) {
        const s = byId.get(e.source);
        const t = byId.get(e.target);
        if (!s || !t)
            continue;
        const midX = s.x + s.w + (t.x - (s.x + s.w)) / 2;
        edgeBoxes.push({ source: s, target: t, midX });
    }
    return { boxes, edges: edgeBoxes, byId };
}
/**
 * 求选中节点的「所在链路」：全部上游祖先 + 全部下游后代 + 途经这些节点的边。
 * 边 (u,v) 入选 ⇔ u、v 同属「祖先∪{sel}」或同属「后代∪{sel}」。
 */
function chainOf(selId, edges) {
    const outAdj = new Map();
    const inAdj = new Map();
    for (const e of edges) {
        (outAdj.get(e.source) ?? outAdj.set(e.source, []).get(e.source)).push(e.target);
        (inAdj.get(e.target) ?? inAdj.set(e.target, []).get(e.target)).push(e.source);
    }
    const reach = (start, adj) => {
        const seen = new Set();
        const stack = [start];
        while (stack.length) {
            const u = stack.pop();
            for (const v of adj.get(u) ?? []) {
                if (!seen.has(v)) {
                    seen.add(v);
                    stack.push(v);
                }
            }
        }
        return seen;
    };
    const anc = reach(selId, inAdj); // 上游
    const desc = reach(selId, outAdj); // 下游
    const up = new Set([selId, ...anc]);
    const down = new Set([selId, ...desc]);
    const nodes = new Set([...up, ...down]);
    const hiEdges = new Set();
    for (const e of edges) {
        const inUp = up.has(e.source) && up.has(e.target);
        const inDown = down.has(e.source) && down.has(e.target);
        if (inUp || inDown)
            hiEdges.add(edgeKey(e.source, e.target));
    }
    return { nodes, edges: hiEdges };
}
