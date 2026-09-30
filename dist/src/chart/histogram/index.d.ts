import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { GridConfig } from '../core/grid';
export interface HistogramChartProps {

    data: Record<string, any>[];
    valueField: string;

    binCount?: number;

    binWidth?: number;
    color?: string | string[];
    height?: number;
    width?: number;

    label?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;

    binFormatter?: (v: number) => string;
    yAxisFormatter?: (v: number) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function HistogramChart(props: HistogramChartProps): React.ReactElement;
export default HistogramChart;
