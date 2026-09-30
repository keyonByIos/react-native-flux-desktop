import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface ScatterChartProps {
    data: Record<string, any>[];
    /** 横轴数值字段 */
    xField: string;
    /** 纵轴数值字段 */
    yField: string;
    /** 分组字段（决定颜色与图例） */
    seriesField?: string;
    /** 第三维数值字段：映射气泡半径（√ 面积比例，即气泡图）；缺省用固定 size */
    sizeField?: string;
    /** 气泡半径范围 [最小, 最大]（px），sizeField 生效 */
    sizeRange?: [number, number];
    /** 点半径（sizeField 缺省时的固定值） */
    size?: number;
    color?: string | string[];
    width?: number;
    height?: number;
    legend?: boolean;
    /** 逐点悬浮提示（默认开） */
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    /** 类目错峰占比（散点用点序错峰） */
    stagger?: number;
    xAxisFormatter?: (v: number) => string;
    yAxisFormatter?: (v: number) => string;
    /** 网格自定义（线色 / 虚实 / 线宽） */
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function ScatterChart(props: ScatterChartProps): React.ReactElement;
export default ScatterChart;
