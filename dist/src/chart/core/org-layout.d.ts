
export interface OrgChartData {
    id?: string;

    label?: string;

    sub?: string;

    color?: string;
    children?: OrgChartData[];
}

export interface OrgNodeBox {
    id: string;
    label: string;
    sub?: string;
    color?: string;
    x: number;
    y: number;
    w: number;
    h: number;
    cx: number;
    cy: number;
    depth: number;
    parentId: string | null;
    hasChildren: boolean;
}

export interface OrgEdge {
    from: OrgNodeBox;
    to: OrgNodeBox;
}
export interface OrgLayoutOptions {
    width: number;
    height: number;
    direction: 'vertical' | 'horizontal';

    nodeW?: number;

    nodeH?: number;

    gapX?: number;

    gapY?: number;

    padding?: number;
}

export declare function layoutOrg(root: OrgChartData, opts: OrgLayoutOptions): {
    boxes: OrgNodeBox[];
    edges: OrgEdge[];
};
