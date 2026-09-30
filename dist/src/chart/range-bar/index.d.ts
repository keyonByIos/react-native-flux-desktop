import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface RangeBarProps {

    data: Record<string, any>[];
    yField: string;
    startField: string;
    endField: string;

    color?: string | string[];

    colorField?: string;
    height?: number;
    width?: number;

    barRatio?: number;

    label?: boolean;

    radius?: number;
    legend?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    xAxisFormatter?: (v: number) => string;
    yAxisFormatter?: (s: string) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function RangeBarChart(props: RangeBarProps): React.ReactElement;
export default RangeBarChart;
