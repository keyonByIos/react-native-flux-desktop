import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RadarChartProps {
    data: Record<string, any>[];

    xField: string;

    yField: string;
    seriesField?: string;

    size?: number;
    color?: string | string[];

    levels?: number;

    point?: boolean;

    fill?: boolean;
    legend?: boolean;
    animation?: boolean;
    animateDuration?: number;

    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function RadarChart(props: RadarChartProps): React.ReactElement;
export default RadarChart;
