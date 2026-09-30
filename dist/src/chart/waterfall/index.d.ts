import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { GridConfig } from '../core/grid';
export interface WaterfallChartProps {
    data: Record<string, any>[];
    xField?: string;

    yField?: string;

    totalField?: string;
    color?: {
        increase?: string;
        decrease?: string;
        total?: string;
    };
    height?: number;
    width?: number;
    radius?: number;

    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    stagger?: number;
    yAxisFormatter?: (v: number) => string;

    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function WaterfallChart(props: WaterfallChartProps): React.ReactElement;
export default WaterfallChart;
