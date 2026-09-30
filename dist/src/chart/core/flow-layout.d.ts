
export interface FlowNodeData {
    id: string;

    label: string;

    sub?: string;

    color?: string;
}

export interface FlowEdgeData {
    source: string;
    target: string;
}
export interface FlowGraphData {
    nodes: FlowNodeData[];
    edges: FlowEdgeData[];
}

export interface FlowNodeBox extends FlowNodeData {
    x: number;
    y: number;
    w: number;
    h: number;
    layer: number;
}

export interface FlowEdgeBox {
    source: FlowNodeBox;
    target: FlowNodeBox;

    midX: number;
}
export interface FlowLayoutOptions {
    width: number;
    height: number;

    nodeH?: number;

    nodeH2?: number;

    nodeW?: number;

    gapX?: number;

    gapY?: number;

    padding?: number;
}

export interface FlowChain {
    nodes: Set<string>;

    edges: Set<string>;
}
export declare function edgeKey(source: string, target: string): string;

export declare function layoutFlow(graph: FlowGraphData, opts: FlowLayoutOptions): {
    boxes: FlowNodeBox[];
    edges: FlowEdgeBox[];
    byId: Map<string, FlowNodeBox>;
};

export declare function chainOf(selId: string, edges: FlowEdgeData[]): FlowChain;
