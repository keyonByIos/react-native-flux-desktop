import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { GridConfig } from '../core/grid';
export interface WaterfallChartProps {
    data: Record<string, any>[];
    xField?: string;
    /** 数值字段（增减量；合计行给该点的绝对累计值） */
    yField?: string;
    /** 标记「合计行」的字段（真值即视为合计，从 0 画到当前累计） */
    totalField?: string;
    color?: {
        increase?: string;
        decrease?: string;
        total?: string;
    };
    height?: number;
    width?: number;
    radius?: number;
    /** 悬浮高亮 + tooltip（数值增减 / 累计），默认开 */
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    stagger?: number;
    yAxisFormatter?: (v: number) => string;
    /** 网格自定义（线色 / 虚实 / 线宽 / 纵向网格） */
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function WaterfallChart(props: WaterfallChartProps): React.ReactElement;
export default WaterfallChart;
