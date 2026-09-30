import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export type IndicatorType = 'VOL' | 'MACD' | 'RSI' | 'KDJ';
export interface IndicatorChartProps {
    data: Record<string, any>[];
    xField?: string;
    openField?: string;
    highField?: string;
    lowField?: string;
    closeField?: string;
    volumeField?: string;
    type: IndicatorType;

    params?: number[];

    label?: string;
    height?: number;
    width?: number;
    upColor?: string;
    downColor?: string;

    showXAxis?: boolean;
    grid?: GridConfig;
    yFormatter?: (v: number) => string;
    legend?: boolean;
    animation?: boolean;
    animateDuration?: number;

    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function IndicatorChart(props: IndicatorChartProps): React.ReactElement;
export default IndicatorChart;
