import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type RefLine } from '../core/common';
import type { GridConfig } from '../core/grid';
export interface AreaChartProps {
    data: Record<string, any>[];
    xField: string;
    yField: string;
    seriesField?: string;
    color?: string | string[];
    height?: number;
    width?: number;
    stack?: boolean;
    fillOpacity?: string;
    /** 渐变填充：面积自顶（fillOpacity）向基线渐隐（ECharts/antd 标志性观感）；堆叠时每段各自渐隐 */
    gradient?: boolean;
    /** 平滑曲线边界（Catmull-Rom 过点）；默认 false 为直折线边界 */
    smooth?: boolean;
    /** 上边界数据点圆点标记（默认关，面积图通常不显点以免拥挤） */
    point?: boolean;
    /** 数据标签：上边界点上方显示数值（需揭示到该 x 后才现） */
    label?: boolean;
    legend?: boolean;
    /** 悬浮提示 + 十字准星（默认开） */
    tooltip?: boolean;
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
export declare function AreaChart(props: AreaChartProps): React.ReactElement;
export default AreaChart;
