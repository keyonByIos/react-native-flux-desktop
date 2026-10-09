import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { TreeChartData } from '../core/tree-layout';
export interface IndentedTreeProps {
    data: TreeChartData;
    width: number;
    height: number;
    /** 子节点方向：right（默认）= 父左子右；left = 镜像 */
    side?: 'right' | 'left';
    /** 节点样式 */
    nodeStyle?: 'filled' | 'line' | 'box';
    /** 每层缩进像素 */
    indent?: number;
    /** 行高（含间距） */
    rowHeight?: number;
    /** 节点高度 */
    nodeHeight?: number;
    /** 节点圆角 */
    nodeRadius?: number;
    /** 节点字号 */
    fontSize?: number;
    /** 顶部留白 */
    paddingTop?: number;
    /** 左侧（或右侧）起始留白 */
    paddingStart?: number;
    /** 是否按顶层分支着色（line/box 模式常用） */
    colorByBranch?: boolean;
    /** 连线宽度 */
    lineWidth?: number;
    /** 可折叠（点击节点切换子树显隐） */
    collapsible?: boolean;
    /** 初始折叠的节点 id 集合 */
    defaultCollapsed?: string[];
    /** 折叠状态变化回调 */
    onToggle?: (id: string, expanded: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function IndentedTree(props: IndentedTreeProps): React.ReactElement;
export default IndentedTree;
