import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface HeatmapChartProps {
    data: Record<string, any>[];

    xField?: string;

    yField?: string;

    valueField?: string;
    width?: number;
    height?: number;

    color?: string;

    showValue?: boolean;

    cellGap?: number;

    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function HeatmapChart(props: HeatmapChartProps): React.ReactElement;
export default HeatmapChart;
