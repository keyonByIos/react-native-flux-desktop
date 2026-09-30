import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PieChartProps {
    data: Record<string, any>[];
    /** 数值字段 */
    angleField?: string;
    /** 类目字段（图例 + 颜色依据） */
    colorField?: string;
    /** 直径 */
    size?: number;
    /** 环形内径比例（0..0.9）；>0 即环形 */
    innerRadius?: number;
    color?: string | string[];
    legend?: boolean;
    /** 扇区间隙角（度） */
    padAngle?: number;
    animation?: boolean;
    animateDuration?: number;
    /** 中心标题（donut） */
    centerTitle?: string;
    /** 数据标签：扇区中角外侧显示百分比（占比过小不画） */
    label?: boolean;
    /** 悬浮交互：命中扇区外扩 + 邻区压暗 + tooltip 气泡（默认开） */
    tooltip?: boolean;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function PieChart(props: PieChartProps): React.ReactElement;
export default PieChart;
