import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { TreeChartData } from '../core/tree-layout';
export interface MindMapChartProps {
    data: TreeChartData;
    width: number;
    height: number;
    /** 子节点分布：both = 左右两侧（默认）；right / left = 全在一侧 */
    side?: 'both' | 'right' | 'left';
    /** 节点样式 */
    nodeStyle?: 'filled' | 'line' | 'box';
    /** 节点高度 */
    nodeH?: number;
    /** 节点文字左右内边距 */
    padX?: number;
    /** 父子水平间距 */
    levelGap?: number;
    /** 相邻叶节点垂直间距 */
    leafGap?: number;
    /** 节点字号 */
    fontSize?: number;
    /** 连线宽度 */
    lineWidth?: number;
    /** 可折叠（点击带子节点的项切换子树显隐） */
    collapsible?: boolean;
    /** 初始折叠的节点 id 集合 */
    defaultCollapsed?: string[];
    /** 折叠状态变化回调 */
    onToggle?: (id: string, expanded: boolean) => void;
    animation?: boolean;
    animateDuration?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function MindMapChart(props: MindMapChartProps): React.ReactElement;
export default MindMapChart;
