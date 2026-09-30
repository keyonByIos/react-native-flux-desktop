import type { TreeChartData } from './tree-layout';

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

    branch: number;

    dir: 1 | -1 | 0;
    parentId: string | null;
    hasChildren: boolean;
    collapsed: boolean;
}

export interface MindMapEdge {
    from: MindMapNodeBox;
    to: MindMapNodeBox;
}
export interface MindMapLayoutOptions {
    width: number;
    height: number;

    side: 'both' | 'right' | 'left';

    nodeH?: number;

    padX?: number;

    levelGap?: number;

    leafGap?: number;

    padding?: number;
}

export declare function layoutMindMap(root: TreeChartData, opts: MindMapLayoutOptions, measure: (label: string) => number, collapsed: Set<string>): {
    boxes: MindMapNodeBox[];
    edges: MindMapEdge[];
};
