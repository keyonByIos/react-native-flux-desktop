"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutMindMap = layoutMindMap;
/**
 * 思维导图布局：返回可见节点的几何框与父子边。
 * collapsed 集合中的节点不再展开其子树（自身保留，呈"叶"态）。
 */
function layoutMindMap(root, opts, measure, collapsed) {
    const { width, height, side, nodeH = 24, padX = 9, levelGap = 28, leafGap = 10, padding = 20, } = opts;
    let seq = 0;
    const build = (n) => {
        const id = n.id ?? `m${++seq}`;
        const label = n.label ?? id;
        return { id, label, w: Math.ceil(measure(label)) + padX * 2, children: (n.children ?? []).map(build) };
    };
    const r = build(root);
    const boxes = [];
    const edges = [];
    // ② 单侧堆叠：叶按 cursor 依次落位，内部节点取子中点。返回该侧总高与顶层框。
    const stackSide = (kids, dir, branchBase) => {
        let cursor = 0;
        const tops = [];
        const place = (n, depth, branch, parent) => {
            const isCollapsed = collapsed.has(n.id);
            const box = {
                id: n.id, label: n.label, w: n.w, h: nodeH,
                x: 0, y: 0, cx: 0, cy: 0,
                depth, branch, dir,
                parentId: parent ? parent.id : null,
                hasChildren: n.children.length > 0,
                collapsed: isCollapsed,
            };
            if (n.children.length === 0 || isCollapsed) {
                box.cy = cursor + nodeH / 2;
                cursor += nodeH + leafGap;
            }
            else {
                let first = 0;
                let last = 0;
                n.children.forEach((c, i) => {
                    const cb = place(c, depth + 1, branch, box);
                    if (i === 0)
                        first = cb.cy;
                    last = cb.cy;
                });
                box.cy = (first + last) / 2;
            }
            boxes.push(box);
            if (parent)
                edges.push({ from: parent, to: box });
            else
                tops.push(box);
            return box;
        };
        kids.forEach((k, i) => { place(k, 1, branchBase + i, null); });
        return { h: Math.max(cursor - leafGap, nodeH), tops };
    };
    // 根的子树分配：both → 前 floor(n/2) 个在左、其余在右；单边模式全在一侧
    const n = r.children.length;
    const leftCount = collapsed.has(r.id) ? 0
        : side === 'left' ? n : side === 'right' ? 0 : Math.floor(n / 2);
    const leftRes = stackSide(r.children.slice(0, leftCount), -1, 0);
    const rightRes = stackSide(r.children.slice(leftCount), 1, leftCount);
    // ③ 垂直居中：以两侧较高者定内容带，根 cy 落中线；各侧在带内再各自居中
    const contentH = Math.max(leftRes.h, rightRes.h, nodeH);
    const top = Math.max(4, (height - contentH) / 2);
    const shift = (sideH, dir) => {
        const off = top + (contentH - sideH) / 2;
        for (const b of boxes)
            if (b.dir === dir)
                b.cy += off;
    };
    shift(leftRes.h, -1);
    shift(rightRes.h, 1);
    const rootBox = {
        id: r.id, label: r.label, w: r.w, h: nodeH,
        x: 0, y: 0, cx: 0, cy: top + contentH / 2,
        depth: 0, branch: -1, dir: 0,
        parentId: null, hasChildren: n > 0, collapsed: collapsed.has(r.id),
    };
    const rootX = side === 'both' ? width / 2
        : side === 'right' ? padding + r.w / 2
            : width - padding - r.w / 2;
    rootBox.cx = rootX;
    boxes.push(rootBox);
    for (const t of [...leftRes.tops, ...rightRes.tops]) {
        t.parentId = rootBox.id; // 建根时顶层框已生成，此处回填父链供 ④ 推 x
        edges.push({ from: rootBox, to: t });
    }
    // ④ x 按深度推进（父缘 + levelGap），最后统一换算 x/y
    const byId = new Map(boxes.map((b) => [b.id, b]));
    const ordered = [...boxes].sort((a, b) => a.depth - b.depth);
    for (const b of ordered) {
        if (b.depth === 0) {
            b.x = b.cx - b.w / 2;
        }
        else {
            const p = byId.get(b.parentId);
            if (!p)
                continue;
            b.x = b.dir === 1 ? p.x + p.w + levelGap : p.x - levelGap - b.w;
            b.cx = b.x + b.w / 2;
        }
        b.y = b.cy - b.h / 2;
    }
    // ⑤ 整体水平居中（仅双侧模式）：两侧子树不对称时根不在视觉中点，按包围盒平移；
    // 单边模式根贴左/右缘是约定语义，不做居中
    if (side === 'both') {
        let minX = Infinity;
        let maxX = -Infinity;
        for (const b of boxes) {
            if (b.x < minX)
                minX = b.x;
            if (b.x + b.w > maxX)
                maxX = b.x + b.w;
        }
        const dx = (width - (minX + maxX)) / 2;
        if (Math.abs(dx) > 0.5) {
            for (const b of boxes) {
                b.x += dx;
                b.cx += dx;
            }
        }
    }
    return { boxes, edges };
}
