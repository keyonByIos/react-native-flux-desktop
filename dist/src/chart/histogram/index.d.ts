import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { GridConfig } from '../core/grid';
export interface HistogramChartProps {
    /** 每行一个样本，取 valueField 的数值参与分箱 */
    data: Record<string, any>[];
    valueField: string;
    /** 期望箱数（与 binWidth 二选一；都不给走 Freedman–Diaconis 自动） */
    binCount?: number;
    /** 固定箱宽（优先于 binCount） */
    binWidth?: number;
    color?: string | string[];
    height?: number;
    width?: number;
    /** 柱顶频数标签 */
    label?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    /** x 轴刻度标签（箱下界）格式化，默认紧凑数 */
    binFormatter?: (v: number) => string;
    yAxisFormatter?: (v: number) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function HistogramChart(props: HistogramChartProps): React.ReactElement;
export default HistogramChart;
