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

    gradient?: boolean;

    smooth?: boolean;

    point?: boolean;

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
export declare function AreaChart(props: AreaChartProps): React.ReactElement;
export default AreaChart;
