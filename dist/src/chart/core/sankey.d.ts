export interface SankeyLinkInput {

    source: number;

    target: number;

    value: number;
}
export interface SankeyNode {
    index: number;
    name: string;

    value: number;

    depth: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}
export interface SankeyLink extends SankeyLinkInput {

    width: number;

    y0: number;

    y1: number;
}
export interface SankeyLayout {
    nodes: SankeyNode[];
    links: SankeyLink[];

    columns: number;

    ky: number;
}
export interface SankeyOptions {
    width: number;
    height: number;

    nodeWidth?: number;

    nodePadding?: number;
}

export declare function layoutSankey(names: string[], inputs: SankeyLinkInput[], opts: SankeyOptions): SankeyLayout;

export declare function sankeyRibbon(sx: number, sy: number, tx: number, ty: number, w: number): string;
