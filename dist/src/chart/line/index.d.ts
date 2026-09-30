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

    point?: boolean;

    lineWidth?: number;

    dash?: [number, number];

    smooth?: boolean;

    step?: 'start' | 'middle' | 'end';

    label?: boolean;
    legend?: boolean;

    tooltip?: boolean;

    animation?: boolean;
    animateDuration?: number;
    yAxisFormatter?: (v: number) => string;
    xAxisFormatter?: (s: string) => string;

    grid?: GridConfig;

    referenceLine?: RefLine[];
    style?: StyleProp<ViewStyle>;
}
export declare function LineChart(props: LineChartProps): React.ReactElement;
export default LineChart;
