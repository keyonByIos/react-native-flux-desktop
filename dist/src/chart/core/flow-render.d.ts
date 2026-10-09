import type { FlowEdgeBox, FlowNodeBox, FlowChain } from './flow-layout';
export interface DrawFlowOptions {
    fontFamily: string;
    fontSize: number;
    subFontSize: number;
    /** 默认节点主色（数据未给 color 时） */
    primary: string;
    /** 基础态边色 */
    edgeColor: string;
    edgeWidth: number;
    /** 卡体正文色（sub 行） */
    bodyTextColor: string;
    /** 高亮链路色（链路内节点描边） */
    chainStroke: string;
    /** 高亮链路文字色 */
    chainText: string;
    /** 链路集合；null = 普通着色模式 */
    chain: FlowChain | null;
    selectedId: string | null;
    /** 入场淡入 0→1 */
    reveal: number;
}
/** 主入口：先边后节点（节点压住箭头根部）。清空由 CanvasLayer 负责。 */
export declare function drawFlow(ctx: any, nodes: FlowNodeBox[], edges: FlowEdgeBox[], opts: DrawFlowOptions): void;
