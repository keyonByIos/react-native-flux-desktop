import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface TimeSharingChartProps {
    data: Record<string, any>[];
    xField?: string;

    priceField?: string;

    avgField?: string;

    prevClose?: number;
    showAvg?: boolean;
    showArea?: boolean;

    upColor?: string;

    downColor?: string;

    avgColor?: string;
    height?: number;
    width?: number;
    animation?: boolean;
    animateDuration?: number;
    yFormatter?: (v: number) => string;

    grid?: GridConfig;

    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function TimeSharingChart(props: TimeSharingChartProps): React.ReactElement;
export default TimeSharingChart;
