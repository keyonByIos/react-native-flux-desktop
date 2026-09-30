import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';

export interface CandleOverlay {

    name?: string;

    color?: string;

    width?: number;

    values: (number | null)[];
}

export declare function movingAverage(values: number[], window: number): (number | null)[];
export interface CandlestickChartProps {
    data: Record<string, any>[];

    xField?: string;
    openField?: string;
    highField?: string;
    lowField?: string;
    closeField?: string;

    volumeField?: string;

    upColor?: string;

    downColor?: string;

    hollowUp?: boolean;

    variant?: 'candle' | 'ohlc';

    showXAxis?: boolean;

    showVolume?: boolean;
    height?: number;
    width?: number;
    animation?: boolean;
    animateDuration?: number;
    stagger?: number;
    yFormatter?: (v: number) => string;

    overlays?: CandleOverlay[];

    grid?: GridConfig;

    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function CandlestickChart(props: CandlestickChartProps): React.ReactElement;
export default CandlestickChart;
