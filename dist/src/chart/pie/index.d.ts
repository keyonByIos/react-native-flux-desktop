import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PieChartProps {
    data: Record<string, any>[];

    angleField?: string;

    colorField?: string;

    size?: number;

    innerRadius?: number;
    color?: string | string[];
    legend?: boolean;

    padAngle?: number;
    animation?: boolean;
    animateDuration?: number;

    centerTitle?: string;

    label?: boolean;

    tooltip?: boolean;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function PieChart(props: PieChartProps): React.ReactElement;
export default PieChart;
