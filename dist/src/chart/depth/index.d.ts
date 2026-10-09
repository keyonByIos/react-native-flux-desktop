import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface DepthLevel {
    price: number;
    size: number;
}
export interface DepthChartProps {
    /** 买盘挂单（价低于 mid） */
    bids: DepthLevel[];
    /** 卖盘挂单（价高于 mid） */
    asks: DepthLevel[];
    /** 累计深度（默认 true，山形）；false 为逐档梳状 */
    cumulative?: boolean;
    /** 买盘色（默认绿） */
    bidColor?: string;
    /** 卖盘色（默认红） */
    askColor?: string;
    height?: number;
    width?: number;
    grid?: GridConfig;
    priceFormatter?: (v: number) => string;
    sizeFormatter?: (v: number) => string;
    animation?: boolean;
    animateDuration?: number;
    /** 悬浮逐档准星 + 价格/挂单量/累计气泡（默认开） */
    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function DepthChart(props: DepthChartProps): React.ReactElement;
export default DepthChart;
