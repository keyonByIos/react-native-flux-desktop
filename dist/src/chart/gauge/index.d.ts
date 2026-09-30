import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface GaugeChartProps {

    value?: number;

    max?: number;

    size?: number;

    strokeWidth?: number;

    color?: string;

    title?: string;

    formatter?: (v: number) => string;
    animation?: boolean;
    animateDuration?: number;

    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function GaugeChart(props: GaugeChartProps): React.ReactElement;
export default GaugeChart;
