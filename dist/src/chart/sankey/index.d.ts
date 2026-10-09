import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SankeyLinkDatum {
    source: number | string;
    target: number | string;
    value: number;
}
export interface SankeyChartProps {
    /** 节点（字符串名或 {name}）；links 的 source/target 可用下标或名字引用 */
    nodes: (string | {
        name: string;
    })[];
    links: SankeyLinkDatum[];
    width?: number;
    height?: number;
    /** 节点矩形宽度 */
    nodeWidth?: number;
    /** 同列节点竖直间隙 */
    nodePadding?: number;
    /** 节点名称标签 */
    label?: boolean;
    /** 悬浮交互：节点/链路高亮联动 + tooltip 气泡（默认开） */
    tooltip?: boolean;
    color?: string | string[];
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function SankeyChart(props: SankeyChartProps): React.ReactElement;
export default SankeyChart;
