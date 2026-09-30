import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RadarChartProps {
    data: Record<string, any>[];
    /** 维度字段（雷达各轴名） */
    xField: string;
    /** 数值字段 */
    yField: string;
    seriesField?: string;
    /** 画布边长 */
    size?: number;
    color?: string | string[];
    /** 网格环层数 */
    levels?: number;
    /** 顶点圆点 */
    point?: boolean;
    /** 多边形面积填充 */
    fill?: boolean;
    legend?: boolean;
    animation?: boolean;
    animateDuration?: number;
    /** 悬浮顶点显 系列/维度/数值 气泡（默认开，需 point） */
    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function RadarChart(props: RadarChartProps): React.ReactElement;
export default RadarChart;
