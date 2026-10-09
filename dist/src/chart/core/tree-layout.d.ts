export interface TreeChartData {
    /** 节点唯一 id（未提供时按遍历序自动生成） */
    id?: string;
    /** 显示标签；缺省用 id */
    label?: string;
    children?: TreeChartData[];
}
export type TreeDirection = 'horizontal' | 'vertical' | 'radial';
/** 布局中间态：抽象坐标。 */
export interface TreePos {
    id: string;
    label: string;
    depth: number;
    cross: number;
    parentId: string | null;
    isLeaf: boolean;
}
/** 渲染坐标：笛卡尔或极坐标（径向用）。 */
export interface TreePoint {
    id: string;
    label: string;
    x: number;
    y: number;
    /** 径向模式：节点所在角度（弧度，12 点为 0，顺时针） */
    angle?: number;
    /** 径向模式：节点所在半径 */
    radius?: number;
    isLeaf: boolean;
    parentId: string | null;
}
export interface TreeEdge {
    from: TreePoint;
    to: TreePoint;
}
/**
 * Dendrogram（生态树）：所有叶在同一 depth = maxDepth；非叶 depth = maxDepth - height(node)。
 * 短枝被"拉伸"到与长枝同层，视觉上叶排成一条直线（水平/垂直）或同一圆周（径向）。
 */
export declare function layoutDendrogram(root: TreeChartData): {
    positions: TreePos[];
    leafCount: number;
    maxDepth: number;
};
/**
 * CompactBox（紧凑树）：depth = 自然树深（根 0，逐层 +1）；叶可在不同 depth。
 * 相同 cross 分配规则；因叶不必同层，视觉上更紧凑，父节点常与部分子节点同高。
 */
export declare function layoutCompactBox(root: TreeChartData): {
    positions: TreePos[];
    leafCount: number;
    maxDepth: number;
};
export interface ToXYOptions {
    direction: TreeDirection;
    width: number;
    height: number;
    /** 主轴 padding（根到边、叶到对边都留此距） */
    paddingMain: number;
    /** 副轴 padding（首末叶到边） */
    paddingCross: number;
    /** 径向内半径（根到第一个节点的距离），只在 direction='radial' 生效 */
    innerRadius: number;
}
/** 把抽象 (depth, cross) 投到画布坐标。 */
export declare function toXY(positions: TreePos[], leafCount: number, maxDepth: number, opts: ToXYOptions): TreePoint[];
/** 由 positions 构边表（用 point id 索引）。 */
export declare function buildEdges(points: TreePoint[]): TreeEdge[];
