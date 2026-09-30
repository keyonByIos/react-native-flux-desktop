import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type RefLine } from '../core/common';
import type { GridConfig } from '../core/grid';
export interface ColumnChartProps {
    data: Record<string, any>[];
    xField: string;
    yField: string;
    seriesField?: string;
    color?: string | string[];
    height?: number;
    width?: number;
    stack?: boolean;

    radius?: number;

    label?: boolean;

    maxColumnWidth?: number;
    legend?: boolean;

    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;

    stagger?: number;
    yAxisFormatter?: (v: number) => string;
    xAxisFormatter?: (s: string) => string;

    grid?: GridConfig;

    referenceLine?: RefLine[];
    style?: StyleProp<ViewStyle>;
}
export declare function ColumnChart(props: ColumnChartProps): React.ReactElement;
export default ColumnChart;
