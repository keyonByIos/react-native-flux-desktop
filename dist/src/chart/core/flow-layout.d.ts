/** 流程图节点数据。 */
export interface FlowNodeData {
    id: string;
    /** 主标题（头部条 / 单行框内文字） */
    label: string;
    /** 次行文本（如 "delay: 4min"）；提供则节点渲染为「彩色头 + 白底体」两段卡 */
    sub?: string;
    /** 头部/状态色（调度图：蓝=正常、绿=成功、红=失败）。缺省走主题主色。 */
    color?: string;
}
/** 流程图有向边。 */
export interface FlowEdgeData {
    source: string;
    target: string;
}
export interface FlowGraphData {
    nodes: FlowNodeData[];
    edges: FlowEdgeData[];
}
/** 布局产出的节点框（含笛卡尔几何）。 */
export interface FlowNodeBox extends FlowNodeData {
    x: number;
    y: number;
    w: number;
    h: number;
    layer: number;
}
/** 布局产出的边（连接两节点框，附正交折线的关键点）。 */
export interface FlowEdgeBox {
    source: FlowNodeBox;
    target: FlowNodeBox;
    /** 折线拐点 x（源右缘与目标左缘之间的路由通道） */
    midX: number;
}
export interface FlowLayoutOptions {
    width: number;
    height: number;
    /** 单行节点高度 */
    nodeH?: number;
    /** 两段卡（含 sub）高度 */
    nodeH2?: number;
    /** 节点宽 */
    nodeW?: number;
    /** 层间水平间距 */
    gapX?: number;
    /** 层内垂直间距 */
    gapY?: number;
    /** 四周留白 */
    padding?: number;
}
/** 链路高亮集合：选中节点的整条群流程。 */
export interface FlowChain {
    nodes: Set<string>;
    /** 边 key 形如 `source\u0000target` */
    edges: Set<string>;
}
export declare function edgeKey(source: string, target: string): string;
/**
 * 分层 DAG 布局：返回带几何的节点框与边。
 * 源点（入度 0）落在第 0 层；其余节点 layer = max(前驱 layer) + 1（最长路径分层）。
 */
export declare function layoutFlow(graph: FlowGraphData, opts: FlowLayoutOptions): {
    boxes: FlowNodeBox[];
    edges: FlowEdgeBox[];
    byId: Map<string, FlowNodeBox>;
};
/**
 * 求选中节点的「所在链路」：全部上游祖先 + 全部下游后代 + 途经这些节点的边。
 * 边 (u,v) 入选 ⇔ u、v 同属「祖先∪{sel}」或同属「后代∪{sel}」。
 */
export declare function chainOf(selId: string, edges: FlowEdgeData[]): FlowChain;
