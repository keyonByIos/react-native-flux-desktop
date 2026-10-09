export interface SunburstNode {
    name: string;
    /** 叶子值；非叶节点省略则按后代叶子求和 */
    value?: number;
    children?: SunburstNode[];
}
export interface SunburstArc {
    name: string;
    /** 环序号：1 = 最内环（根的子节点），逐层 +1 */
    depth: number;
    /** 起始角（度，12 点为 0，顺时针） */
    start: number;
    /** 终止角（度） */
    end: number;
    /** 聚合值（叶子值或后代之和） */
    value: number;
    /** 所属顶层分支下标（0-based），用于按分支着色 */
    branch: number;
}
/** 节点聚合值：有 children 则递归求和，否则取自身 value（非有限/负按 0）。 */
export declare function aggregate(node: SunburstNode): number;
/**
 * 把层级树铺成弧数组（不含根）。maxDepth 限制渲染环数（1 = 仅根的子节点环）。
 * 角度守恒：根的子弧填满 [0,360)；任一父弧的区间 = 其子弧区间无缝拼接。
 */
export declare function layoutSunburst(root: SunburstNode, maxDepth?: number): SunburstArc[];
