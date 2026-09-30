import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface BarChartProps {
    data: Record<string, any>[];
    xField: string;
    yField: string;
    seriesField?: string;
    color?: string | string[];
    width?: number;
    height?: number;
    stack?: boolean;
    radius?: number;
    /** 数据标签：条末端（堆叠时段内）显示数值 */
    label?: boolean;
    /** 条高上限（px）：行高大了条不无限增粗，在槽位内居中（antd maxBarWidth 同款） */
    maxBarWidth?: number;
    legend?: boolean;
    /** 悬浮提示 + 行高亮（默认开） */
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    stagger?: number;
    valueFormatter?: (v: number) => string;
    /** 网格自定义（线色 / 虚实 / 线宽） */
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function BarChart(props: BarChartProps): React.ReactElement;
export default BarChart;
