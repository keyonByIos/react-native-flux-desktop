export interface TreeChartData {

    id?: string;

    label?: string;
    children?: TreeChartData[];
}
export type TreeDirection = 'horizontal' | 'vertical' | 'radial';

export interface TreePos {
    id: string;
    label: string;
    depth: number;
    cross: number;
    parentId: string | null;
    isLeaf: boolean;
}

export interface TreePoint {
    id: string;
    label: string;
    x: number;
    y: number;

    angle?: number;

    radius?: number;
    isLeaf: boolean;
    parentId: string | null;
}
export interface TreeEdge {
    from: TreePoint;
    to: TreePoint;
}

export declare function layoutDendrogram(root: TreeChartData): {
    positions: TreePos[];
    leafCount: number;
    maxDepth: number;
};

export declare function layoutCompactBox(root: TreeChartData): {
    positions: TreePos[];
    leafCount: number;
    maxDepth: number;
};
export interface ToXYOptions {
    direction: TreeDirection;
    width: number;
    height: number;

    paddingMain: number;

    paddingCross: number;

    innerRadius: number;
}

export declare function toXY(positions: TreePos[], leafCount: number, maxDepth: number, opts: ToXYOptions): TreePoint[];

export declare function buildEdges(points: TreePoint[]): TreeEdge[];
