import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SparklineChartProps {
    data: Record<string, any>[];
    yField?: string;

    xField?: string;

    type?: 'line' | 'area';
    width?: number;
    height?: number;
    color?: string;

    endDot?: boolean;

    smooth?: boolean;

    tooltip?: boolean;

    valueFormatter?: (v: number) => string;
    animation?: boolean;
    animateDuration?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function SparklineChart(props: SparklineChartProps): React.ReactElement;
export default SparklineChart;
