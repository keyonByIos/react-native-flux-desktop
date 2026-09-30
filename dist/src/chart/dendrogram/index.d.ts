import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type TreeChartData, type TreeDirection } from '../core/tree-layout';
export interface DendrogramChartProps {
    data: TreeChartData;
    width: number;
    height: number;
    direction?: TreeDirection;
    nodeRadius?: number;
    nodeColor?: string;
    edgeColor?: string;
    edgeWidth?: number;
    labelColor?: string;
    fontSize?: number;
    /** 主轴（depth 方向）两端留白 */
    paddingMain?: number;
    /** 副轴（cross 方向）两端留白 */
    paddingCross?: number;
    /** 径向内半径 */
    innerRadius?: number;
    animation?: boolean;
    animateDuration?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function DendrogramChart(props: DendrogramChartProps): React.ReactElement;
export default DendrogramChart;
