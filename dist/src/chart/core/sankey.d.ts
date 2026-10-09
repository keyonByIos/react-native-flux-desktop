export interface SankeyLinkInput {
    /** 源节点下标 */
    source: number;
    /** 目标节点下标 */
    target: number;
    /** 流量（决定带厚） */
    value: number;
}
export interface SankeyNode {
    index: number;
    name: string;
    /** 节点值 = max(总流入, 总流出) */
    value: number;
    /** 列号（0 起） */
    depth: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}
export interface SankeyLink extends SankeyLinkInput {
    /** 带厚（px）= value * ky */
    width: number;
    /** 在源节点内的中心 y */
    y0: number;
    /** 在目标节点内的中心 y */
    y1: number;
}
export interface SankeyLayout {
    nodes: SankeyNode[];
    links: SankeyLink[];
    /** 列数 */
    columns: number;
    /** 值→像素 的公共缩放 */
    ky: number;
}
export interface SankeyOptions {
    width: number;
    height: number;
    /** 节点矩形宽度 */
    nodeWidth?: number;
    /** 同列节点竖直间隙 */
    nodePadding?: number;
}
/**
 * 计算桑基布局。假定输入为 DAG（有环时按访问序兜底，不死循环）。越界下标忽略。
 */
export declare function layoutSankey(names: string[], inputs: SankeyLinkInput[], opts: SankeyOptions): SankeyLayout;
/** 生成一条水平三次贝塞尔缎带 path（源右侧 (sx,y0) → 目标左侧 (tx,y1)，带宽 w 的填充带）。 */
export declare function sankeyRibbon(sx: number, sy: number, tx: number, ty: number, w: number): string;
