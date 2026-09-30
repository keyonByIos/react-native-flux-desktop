import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface TimeSharingChartProps {
    data: Record<string, any>[];
    xField?: string;
    /** 现价字段 */
    priceField?: string;
    /** 均价字段（可选） */
    avgField?: string;
    /** 昨收（基准线 + 对称量程）；缺省用首点现价 */
    prevClose?: number;
    showAvg?: boolean;
    showArea?: boolean;
    /** 涨色（默认红） */
    upColor?: string;
    /** 跌色（默认绿） */
    downColor?: string;
    /** 均价线色（默认金） */
    avgColor?: string;
    height?: number;
    width?: number;
    animation?: boolean;
    animateDuration?: number;
    yFormatter?: (v: number) => string;
    /** 网格自定义（线色 / 虚实 / 线宽） */
    grid?: GridConfig;
    /** 悬浮十字准星 + 时刻气泡（默认开） */
    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function TimeSharingChart(props: TimeSharingChartProps): React.ReactElement;
export default TimeSharingChart;
