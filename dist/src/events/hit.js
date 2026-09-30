"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hitTest = hitTest;
exports.findScrollParent = findScrollParent;
exports.findPressable = findPressable;
exports.findMoveTarget = findMoveTarget;
exports.findDraggable = findDraggable;
exports.findDroppable = findDroppable;
exports.findCursor = findCursor;
/** 取节点 style 上的有效 zIndex（>0 才视为浮层），否则返回 0 */
function selfZ(n) {
    const z = n.style.zIndex;
    if (z == null)
        return 0;
    const num = Number(z);
    return num > 0 ? num : 0;
}
/**
 * 返回包含该点的最上层可见节点。
 * 优先按 z-index 层级（高层级始终赢过低层级），同层级内文档顺序靠后者覆盖靠前。
 */
function hitTest(root, px, py) {
    let best = null;
    let bestZ = -1;
    // 裁剪链：滚动容器与 overflow:hidden 的祖先会把子孙"剪掉"，被剪掉的部分不能再被命中
    // 坑：此前只剔「整矩形在裁剪外」的子树，不校验鼠标点本身在裁剪矩形内——
    // 滚出视口顶部的内容节点（矩形与裁剪区部分相交）会偷走顶部栏的点击。
    // 与 painter 语义对齐：zIndex>0 浮层基线趟被登记、第二趟走根 ctx 重绘（不受祖先 clip），
    // 命中测试对这类节点（及其子树，经 inheritedZ 继承）同样豁免。
    const visit = (n, clip, inheritedZ) => {
        if (!n.visible || n.style.display === 'none')
            return;
        // pointerEvents:'none' 的浮层（如文本选中高亮块）整棵子树不参与命中，点击穿透回正文
        if (n.props && n.props.pointerEvents === 'none')
            return;
        const myZ = selfZ(n) || inheritedZ;
        const overlay = myZ > 0;
        const x0 = n.ax;
        const y0 = n.ay;
        const x1 = n.ax + n.w;
        const y1 = n.ay + n.h;
        if (!overlay && (x1 <= clip.x0 || x0 >= clip.x1 || y1 <= clip.y0 || y0 >= clip.y1))
            return;
        const inClip = overlay || (px >= clip.x0 && px <= clip.x1 && py >= clip.y0 && py <= clip.y1);
        if (inClip && px >= x0 && px <= x1 && py >= y0 && py <= y1) {
            // z-index 高的优先；同 z 则后访问的（文档序靠后）覆盖先访问的
            if (myZ >= bestZ) {
                best = n;
                bestZ = myZ;
            }
        }
        let childClip = clip;
        if (n.kind === 'scroll' || n.style.overflow === 'hidden') {
            childClip = {
                x0: Math.max(clip.x0, x0),
                y0: Math.max(clip.y0, y0),
                x1: Math.min(clip.x1, x1),
                y1: Math.min(clip.y1, y1),
            };
        }
        for (const c of n.children)
            visit(c, childClip, myZ);
    };
    visit(root, { x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity }, 0);
    return best;
}
/** 从命中节点向上找最近的滚动容器 */
function findScrollParent(node) {
    let cur = node;
    while (cur) {
        if (cur.kind === 'scroll')
            return cur;
        cur = cur.parent;
    }
    return null;
}
/** 从命中节点向上找最近的可交互祖先（RN 里 Pressable 包住 Text，点文字也要能按） */
function findPressable(node) {
    let cur = node;
    while (cur) {
        const p = cur.props || {};
        if (!p.disabled && (p.onPress || p.onPressIn || p.onPressOut))
            return cur;
        cur = cur.parent;
    }
    return null;
}
/**
 * 从命中节点向上找最近带 `onMouseMove` 的节点（连续悬停移动派发用）。
 * 与 findPressable 解耦：一个只带 onMouseMove 的透明覆盖层（如图表 hover）不是 pressable，
 * 但仍需收到带局部坐标的连续 move，故单开一条上溯。
 */
function findMoveTarget(node) {
    let cur = node;
    while (cur) {
        if (cur.props && cur.props.onMouseMove)
            return cur;
        cur = cur.parent;
    }
    return null;
}
/**
 * 从命中节点向上找最近带 __drag / __drop 标记（{ id } 且 id>0）的节点（in-app 拖拽，见 window/drag.ts）。
 * 与 findPressable 同理读 props 上的活标记：useDrag/useDrop 每次渲染只写 { id }，处理器在注册表里。
 */
function findDragMarker(node, key) {
    let cur = node;
    while (cur) {
        const m = cur.props && cur.props[key];
        if (m && typeof m.id === 'number' && m.id > 0)
            return cur;
        cur = cur.parent;
    }
    return null;
}
/** 向上找最近的拖拽源节点（按下后越阈起拖） */
function findDraggable(node) {
    return findDragMarker(node, '__drag');
}
/** 向上找最近的放置目标节点（拖拽悬停/释放派发 enter/leave/drop） */
function findDroppable(node) {
    return findDragMarker(node, '__drop');
}
/**
 * 从命中节点向上解析光标形状，返回底层 setCursor 可识别的规范名。
 * 优先级：最近的显式 style.cursor > 交互节点（禁用→not-allowed，启用→pointer）> default。
 * 与 findPressable 一致地在「第一个交互祖先」处止步，因此禁用按钮/日期格悬停即显示 not-allowed。
 */
function findCursor(node) {
    let cur = node;
    while (cur) {
        const c = cur.style && cur.style.cursor;
        if (typeof c === 'string' && c)
            return c;
        const p = cur.props || {};
        if (p.onPress || p.onPressIn || p.onPressOut) {
            return p.disabled ? 'not-allowed' : 'pointer';
        }
        cur = cur.parent;
    }
    return 'default';
}
