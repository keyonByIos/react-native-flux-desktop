import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { GridConfig } from '../core/grid';
export interface ComboChartProps {
    data: Record<string, any>[];
    xField: string;
    /** 柱数值字段 */
    barField: string;
    /** 折线数值字段 */
    lineField: string;
    /** [柱色, 线色] */
    color?: [string, string];
    height?: number;
    width?: number;
    radius?: number;
    legend?: boolean;
    /** 悬浮提示 + 十字准星（默认开） */
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    yAxisFormatter?: (v: number) => string;
    /** 网格自定义（线色 / 虚实 / 线宽 / 纵向网格） */
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function ComboChart(props: ComboChartProps): React.ReactElement;
export default ComboChart;
