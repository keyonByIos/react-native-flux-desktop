import type { FlowEdgeBox, FlowNodeBox, FlowChain } from './flow-layout';
export interface DrawFlowOptions {
    fontFamily: string;
    fontSize: number;
    subFontSize: number;

    primary: string;

    edgeColor: string;
    edgeWidth: number;

    bodyTextColor: string;

    chainStroke: string;

    chainText: string;

    chain: FlowChain | null;
    selectedId: string | null;

    reveal: number;
}

export declare function drawFlow(ctx: any, nodes: FlowNodeBox[], edges: FlowEdgeBox[], opts: DrawFlowOptions): void;
