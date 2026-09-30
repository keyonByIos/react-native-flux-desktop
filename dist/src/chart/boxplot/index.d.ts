import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface BoxPlotProps {

    data: Record<string, any>[];
    xField: string;

    yField: string;
    color?: string | string[];
    height?: number;
    width?: number;

    mean?: boolean;

    outliers?: boolean;

    boxOpacity?: string;
    legend?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    yAxisFormatter?: (v: number) => string;
    xAxisFormatter?: (s: string) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function BoxPlotChart(props: BoxPlotProps): React.ReactElement;
export default BoxPlotChart;
