import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface HeatmapChartProps {
    data: Record<string, any>[];
    /** x 类目字段 */
    xField?: string;
    /** y 类目字段 */
    yField?: string;
    /** 数值字段（决定强度） */
    valueField?: string;
    width?: number;
    height?: number;
    /** 基准色（alpha 随值 0→1 递增） */
    color?: string;
    /** 是否显示单元格数值 */
    showValue?: boolean;
    /** 单元间隙 */
    cellGap?: number;
    /** 悬浮高亮单元格 + tooltip（x/y 类目 + 数值），默认开 */
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function HeatmapChart(props: HeatmapChartProps): React.ReactElement;
export default HeatmapChart;
