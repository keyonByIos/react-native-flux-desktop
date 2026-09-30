import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface ScatterChartProps {
    data: Record<string, any>[];

    xField: string;

    yField: string;

    seriesField?: string;

    sizeField?: string;

    sizeRange?: [number, number];

    size?: number;
    color?: string | string[];
    width?: number;
    height?: number;
    legend?: boolean;

    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;

    stagger?: number;
    xAxisFormatter?: (v: number) => string;
    yAxisFormatter?: (v: number) => string;

    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function ScatterChart(props: ScatterChartProps): React.ReactElement;
export default ScatterChart;
