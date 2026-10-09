import type { TreeDirection, TreeEdge, TreePoint } from './tree-layout';
export interface DrawTreeOptions {
    direction: TreeDirection;
    nodeRadius: number;
    nodeColor: string;
    edgeColor: string;
    edgeWidth: number;
    labelColor: string;
    fontSize: number;
    fontFamily: string;
    /** 揭示进度 0→1（入场动画）：按 depth/maxDepth 截断，只画 depth ≤ maxDepth * t 的层 */
    reveal: number;
}
/** 主入口：清空由外层 CanvasLayer 负责，本函数只画内容。 */
export declare function drawTree(ctx: any, points: TreePoint[], edges: TreeEdge[], opts: DrawTreeOptions): void;
