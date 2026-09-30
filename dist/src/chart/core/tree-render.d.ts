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

    reveal: number;
}

export declare function drawTree(ctx: any, points: TreePoint[], edges: TreeEdge[], opts: DrawTreeOptions): void;
