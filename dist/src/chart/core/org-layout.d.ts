/** 组织架构图节点数据。 */
export interface OrgChartData {
    id?: string;
    /** 主文本（simple 块内文字 / 卡片姓名） */
    label?: string;
    /** 职务副行（卡片用） */
    sub?: string;
    /** 卡片主题色（顶条 + 头像圆） */
    color?: string;
    children?: OrgChartData[];
}
/** 布局产出的节点盒（x/y 左上角，cx/cy 中心）。 */
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
/** 父子边（折线两端）。 */
export interface OrgEdge {
    from: OrgNodeBox;
    to: OrgNodeBox;
}
export interface OrgLayoutOptions {
    width: number;
    height: number;
    direction: 'vertical' | 'horizontal';
    /** 交叉轴节点尺寸：vertical = 宽；horizontal = 高 */
    nodeW?: number;
    /** 深度轴节点尺寸：vertical = 高；horizontal = 宽 */
    nodeH?: number;
    /** 兄弟间距（交叉轴） */
    gapX?: number;
    /** 层间距（深度轴） */
    gapY?: number;
    /** 四周留白 */
    padding?: number;
}
/**
 * 组织架构图布局：返回节点盒与父子边。
 * 交叉轴槽位 = 可见叶数 ×（节点尺寸 + 兄弟间距）；超可用长则等比压 slot（保底微距 + 缩节点）。
 */
export declare function layoutOrg(root: OrgChartData, opts: OrgLayoutOptions): {
    boxes: OrgNodeBox[];
    edges: OrgEdge[];
};
