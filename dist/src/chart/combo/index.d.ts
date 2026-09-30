import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { GridConfig } from '../core/grid';
export interface ComboChartProps {
    data: Record<string, any>[];
    xField: string;

    barField: string;

    lineField: string;

    color?: [string, string];
    height?: number;
    width?: number;
    radius?: number;
    legend?: boolean;

    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    yAxisFormatter?: (v: number) => string;

    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function ComboChart(props: ComboChartProps): React.ReactElement;
export default ComboChart;
