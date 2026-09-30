import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface FunnelChartProps {
    data: Record<string, any>[];
    xField?: string;
    yField?: string;
    width?: number;

    stageHeight?: number;

    gap?: number;
    color?: string | string[];

    sortable?: boolean;

    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    stagger?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function FunnelChart(props: FunnelChartProps): React.ReactElement;
export default FunnelChart;
