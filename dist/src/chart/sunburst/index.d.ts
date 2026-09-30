import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type SunburstNode } from '../core/sunburst';
export interface SunburstChartProps {

    data: SunburstNode;

    size?: number;

    innerRadius?: number;

    maxDepth?: number;

    padAngle?: number;

    color?: string | string[];

    legend?: boolean;

    label?: boolean;
    animation?: boolean;
    animateDuration?: number;
    centerTitle?: string;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function SunburstChart(props: SunburstChartProps): React.ReactElement;
export default SunburstChart;
