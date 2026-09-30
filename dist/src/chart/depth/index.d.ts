import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface DepthLevel {
    price: number;
    size: number;
}
export interface DepthChartProps {

    bids: DepthLevel[];

    asks: DepthLevel[];

    cumulative?: boolean;

    bidColor?: string;

    askColor?: string;
    height?: number;
    width?: number;
    grid?: GridConfig;
    priceFormatter?: (v: number) => string;
    sizeFormatter?: (v: number) => string;
    animation?: boolean;
    animateDuration?: number;

    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function DepthChart(props: DepthChartProps): React.ReactElement;
export default DepthChart;
