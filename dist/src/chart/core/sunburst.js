"use strict";
// Sunburst 环形树图布局（角度分区）。纯函数、无渲染关切，便于探针验证。
// 输入层级树（value 或叶子值向上聚合），输出每条弧：角度区间 ∝ 聚合值、子弧填满父弧区间、逐层成环。
// 约定：12 点为 0°、顺时针增长（与 geometry.polar / sectorPath 一致）；根节点本身不成环（作中心洞），
// 其子节点为第 1 环、依次向外。branch 记录所属顶层分支下标，供按分支着色 + 逐环提亮。
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregate = aggregate;
exports.layoutSunburst = layoutSunburst;
/** 节点聚合值：有 children 则递归求和，否则取自身 value（非有限/负按 0）。 */
function aggregate(node) {
    if (node.children && node.children.length > 0) {
        return node.children.reduce((a, c) => a + aggregate(c), 0);
    }
    const v = node.value;
    return Number.isFinite(v) && v > 0 ? v : 0;
}
/**
 * 把层级树铺成弧数组（不含根）。maxDepth 限制渲染环数（1 = 仅根的子节点环）。
 * 角度守恒：根的子弧填满 [0,360)；任一父弧的区间 = 其子弧区间无缝拼接。
 */
function layoutSunburst(root, maxDepth = Infinity) {
    const arcs = [];
    const walk = (node, start, end, depth, branch) => {
        const children = node.children ?? [];
        if (children.length === 0 || depth >= maxDepth)
            return;
        const childTotal = children.reduce((a, c) => a + aggregate(c), 0);
        if (childTotal <= 0)
            return;
        const span = end - start;
        let acc = start;
        children.forEach((c, ci) => {
            const frac = aggregate(c) / childTotal;
            const cs = acc;
            acc += span * frac;
            const ce = ci === children.length - 1 ? end : acc; // 末子吸收浮点误差，保证无缝
            const b = depth === 0 ? ci : branch; // 根的子节点即各分支
            arcs.push({ name: c.name, depth: depth + 1, start: cs, end: ce, value: aggregate(c), branch: b });
            walk(c, cs, ce, depth + 1, b);
        });
    };
    walk(root, 0, 360, 0, -1);
    return arcs;
}
