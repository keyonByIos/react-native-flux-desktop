import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface ViolinProps {

    data: Record<string, any>[];
    xField: string;

    yField: string;
    color?: string | string[];
    height?: number;
    width?: number;

    box?: boolean;

    mean?: boolean;

    bandwidth?: number;

    fillOpacity?: string;
    legend?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    yAxisFormatter?: (v: number) => string;
    xAxisFormatter?: (s: string) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function ViolinChart(props: ViolinProps): React.ReactElement;
export default ViolinChart;
