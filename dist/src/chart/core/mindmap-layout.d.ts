import type { TreeChartData } from './tree-layout';
/** 思维导图节点框（x/y 为左上角，cx/cy 为中心）。 */
export interface MindMapNodeBox {
    id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    cx: number;
    cy: number;
    depth: number;
    /** 所属顶层分支下标（根 = -1），用于按分支取色板色 */
    branch: number;
    /** 展开方向：1 = 父左子右；-1 = 父右子左；0 = 根 */
    dir: 1 | -1 | 0;
    parentId: string | null;
    hasChildren: boolean;
    collapsed: boolean;
}
/** 思维导图父子边（连线两端都是节点框）。 */
export interface MindMapEdge {
    from: MindMapNodeBox;
    to: MindMapNodeBox;
}
export interface MindMapLayoutOptions {
    width: number;
    height: number;
    /** 子节点分布：both = 左右两侧（默认）；right / left = 全在一侧 */
    side: 'both' | 'right' | 'left';
    /** 节点高度 */
    nodeH?: number;
    /** 节点文字左右内边距（宽 = 文本实测 + padX*2） */
    padX?: number;
    /** 父子水平间距 */
    levelGap?: number;
    /** 相邻叶节点垂直间距 */
    leafGap?: number;
    /** 单边模式下根距边界的留白 */
    padding?: number;
}
/**
 * 思维导图布局：返回可见节点的几何框与父子边。
 * collapsed 集合中的节点不再展开其子树（自身保留，呈"叶"态）。
 */
export declare function layoutMindMap(root: TreeChartData, opts: MindMapLayoutOptions, measure: (label: string) => number, collapsed: Set<string>): {
    boxes: MindMapNodeBox[];
    edges: MindMapEdge[];
};
