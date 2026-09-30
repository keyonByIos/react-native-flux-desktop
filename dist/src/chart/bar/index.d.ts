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

    label?: boolean;

    maxBarWidth?: number;
    legend?: boolean;

    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    stagger?: number;
    valueFormatter?: (v: number) => string;

    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function BarChart(props: BarChartProps): React.ReactElement;
export default BarChart;
