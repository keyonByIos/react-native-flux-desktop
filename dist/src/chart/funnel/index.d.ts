import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface FunnelChartProps {
    data: Record<string, any>[];
    xField?: string;
    yField?: string;
    width?: number;
    /** 单阶段梯形高 */
    stageHeight?: number;
    /** 阶段间隙（梯形首尾相接，仅留细缝分隔） */
    gap?: number;
    color?: string | string[];
    /** 是否按值降序排列 */
    sortable?: boolean;
    /** 悬浮高亮 + tooltip 气泡（默认开） */
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    stagger?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function FunnelChart(props: FunnelChartProps): React.ReactElement;
export default FunnelChart;
