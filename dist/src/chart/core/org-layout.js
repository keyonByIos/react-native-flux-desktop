"use strict";
// 组织架构图布局层：紧凑树（叶序堆叠 + 父取首末子中点），支持两方向投影：
//   - vertical：深度轴向下（根在顶），交叉轴 = x（叶横向排开）——经典组织架构图；
//   - horizontal：深度轴向右（根在左），交叉轴 = y——「至左向右的组织结构图」。
// 交叉轴超宽时自动压缩：按可用宽/叶槽数定 slot，先收间距、不足再收节点尺寸（文字渲染期截断兜底）。
// 节点为固定尺寸盒（simple 圆角块 / card 人员卡），无需 measureText 注入。
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutOrg = layoutOrg;
/**
 * 组织架构图布局：返回节点盒与父子边。
 * 交叉轴槽位 = 可见叶数 ×（节点尺寸 + 兄弟间距）；超可用长则等比压 slot（保底微距 + 缩节点）。
 */
function layoutOrg(root, opts) {
    const { width, height, direction, nodeW = 70, nodeH = 36, gapX = 24, gapY = 64, padding = 24, } = opts;
    let seq = 0;
    const norm = (n) => ({
        id: n.id ?? `o${++seq}`,
        label: n.label ?? (n.id ?? ''),
        sub: n.sub,
        color: n.color,
        children: (n.children ?? []).map(norm),
    });
    const r = norm(root);
    // 可见叶数 → 交叉轴 slot 压缩
    let leafCount = 0;
    const countLeaves = (n) => {
        if (n.children.length === 0)
            leafCount++;
        else
            for (const c of n.children)
                countLeaves(c);
    };
    countLeaves(r);
    const crossAvail = (direction === 'vertical' ? width : height) - padding * 2;
    // 交叉轴节点尺寸：vertical 用 nodeW（横向叶排），horizontal 用 nodeH（纵向叶排）
    let slotNode = direction === 'vertical' ? nodeW : nodeH;
    let slotGap = gapX;
    const natural = leafCount * (slotNode + slotGap) - slotGap;
    if (natural > crossAvail && leafCount > 0) {
        const slot = crossAvail / leafCount;
        slotGap = Math.max(4, Math.min(slotGap, slot * 0.25));
        slotNode = Math.max(direction === 'vertical' ? 56 : 28, slot - slotGap);
    }
    // 深度轴节点尺寸：vertical 用 nodeH，horizontal 用 nodeW
    const depthNode = direction === 'vertical' ? nodeH : nodeW;
    const boxes = [];
    const edges = [];
    let maxDepth = 0;
    // ① 交叉轴：DFS 叶序堆叠，父 = 首末子中点
    let cursor = 0;
    const place = (n, depth, parentId) => {
        const box = {
            id: n.id, label: n.label, sub: n.sub, color: n.color,
            x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0,
            depth, parentId, hasChildren: n.children.length > 0,
        };
        // 盒尺寸：交叉轴 = slotNode，深度轴 = depthNode
        if (direction === 'vertical') {
            box.w = slotNode;
            box.h = depthNode;
        }
        else {
            box.w = depthNode;
            box.h = slotNode;
        }
        if (n.children.length === 0) {
            const c = cursor + slotNode / 2;
            cursor += slotNode + slotGap;
            if (direction === 'vertical')
                box.cx = c;
            else
                box.cy = c;
        }
        else {
            let first = 0;
            let last = 0;
            n.children.forEach((ch, i) => {
                const cb = place(ch, depth + 1, n.id);
                const cc = direction === 'vertical' ? cb.cx : cb.cy;
                if (i === 0)
                    first = cc;
                last = cc;
            });
            const c = (first + last) / 2;
            if (direction === 'vertical')
                box.cx = c;
            else
                box.cy = c;
        }
        if (depth > maxDepth)
            maxDepth = depth;
        boxes.push(box);
        return box;
    };
    place(r, 0, null);
    for (const b of boxes) {
        if (b.parentId) {
            const p = boxes.find((x) => x.id === b.parentId);
            if (p)
                edges.push({ from: p, to: b });
        }
    }
    // ② 坐标定稿：交叉轴整体居中 + 深度轴按层推进居中
    const crossSpan = Math.max(cursor - slotGap, slotNode);
    const crossStart = ((direction === 'vertical' ? width : height) - crossSpan) / 2;
    const depthSpan = maxDepth * (depthNode + gapY) + depthNode;
    const depthUsable = (direction === 'vertical' ? height : width) - padding * 2;
    const depthStart = padding + Math.max(0, (depthUsable - depthSpan) / 2);
    for (const b of boxes) {
        const cross = (direction === 'vertical' ? b.cx : b.cy) + crossStart;
        const depthPos = depthStart + b.depth * (depthNode + gapY) + depthNode / 2;
        if (direction === 'vertical') {
            b.cx = cross;
            b.cy = depthPos;
        }
        else {
            b.cy = cross;
            b.cx = depthPos;
        }
        b.x = b.cx - b.w / 2;
        b.y = b.cy - b.h / 2;
    }
    return { boxes, edges };
}
