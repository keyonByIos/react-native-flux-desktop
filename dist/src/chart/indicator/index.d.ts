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
    /** 指标参数：MACD [fast,slow,signal] / RSI [period] / KDJ [n,m1,m2] / VOL 忽略 */
    params?: number[];
    /** 面板标题（左上角小字，如 MACD(12,26,9)） */
    label?: string;
    height?: number;
    width?: number;
    upColor?: string;
    downColor?: string;
    /** 是否绘制底部时间轴（多面板堆叠时仅最底块开启） */
    showXAxis?: boolean;
    grid?: GridConfig;
    yFormatter?: (v: number) => string;
    legend?: boolean;
    animation?: boolean;
    animateDuration?: number;
    /** 悬浮逐根竖直准星 + 时刻/指标数值气泡（默认开） */
    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function IndicatorChart(props: IndicatorChartProps): React.ReactElement;
export default IndicatorChart;
