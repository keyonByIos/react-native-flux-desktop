import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type RefLine } from '../core/common';
import type { GridConfig } from '../core/grid';
export interface LineChartProps {
    data: Record<string, any>[];
    xField: string;
    yField: string;
    seriesField?: string;
    color?: string | string[];
    height?: number;
    width?: number;
    /** 是否画顶点圆点 */
    point?: boolean;
    /** 线宽（默认 2） */
    lineWidth?: number;
    /** 虚线模式 [实段, 空白]（如 [6,4]）；缺省实线 */
    dash?: [number, number];
    /** 平滑曲线（Catmull-Rom 过点）；默认 false 为直折线 */
    smooth?: boolean;
    /** 阶梯线型：start 先平后升 / middle 中点转折 / end 先升后平（设置后 smooth 失效） */
    step?: 'start' | 'middle' | 'end';
    /** 数据标签：每个顶点上方显示数值（揭示前沿后的点逐现） */
    label?: boolean;
    legend?: boolean;
    /** 悬浮提示 + 十字准星（默认开） */
    tooltip?: boolean;
    /** 入场动画开关（默认开） */
    animation?: boolean;
    animateDuration?: number;
    yAxisFormatter?: (v: number) => string;
    xAxisFormatter?: (s: string) => string;
    /** 网格自定义（线色 / 虚实 / 线宽 / 纵向网格） */
    grid?: GridConfig;
    /** 横向参考线（阈值/目标）：虚线 + 右端标签，值会并入 y 轴域 */
    referenceLine?: RefLine[];
    style?: StyleProp<ViewStyle>;
}
export declare function LineChart(props: LineChartProps): React.ReactElement;
export default LineChart;
