import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RoseChartProps {
    data: Record<string, any>[];

    xField?: string;

    yField?: string;

    size?: number;

    innerRadius?: number;

    roseType?: 'radius' | 'area';
    color?: string | string[];
    legend?: boolean;

    padAngle?: number;

    label?: boolean;

    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function RoseChart(props: RoseChartProps): React.ReactElement;
export default RoseChart;
