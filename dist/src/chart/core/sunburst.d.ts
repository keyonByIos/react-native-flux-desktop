export interface SunburstNode {
    name: string;

    value?: number;
    children?: SunburstNode[];
}
export interface SunburstArc {
    name: string;

    depth: number;

    start: number;

    end: number;

    value: number;

    branch: number;
}

export declare function aggregate(node: SunburstNode): number;

export declare function layoutSunburst(root: SunburstNode, maxDepth?: number): SunburstArc[];
