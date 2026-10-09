import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface GaugeChartProps {
    /** 当前值 */
    value?: number;
    /** 值域上界（默认 100） */
    max?: number;
    /** 直径 */
    size?: number;
    /** 弧宽 */
    strokeWidth?: number;
    /** 值弧颜色（默认语义阈值：>=85 error、>=60 warning，否则 primary） */
    color?: string;
    /** 中心副标题 */
    title?: string;
    /** 数值格式化 */
    formatter?: (v: number) => string;
    animation?: boolean;
    animateDuration?: number;
    /** 悬浮显示数值气泡 + 值弧端点标记（默认开） */
    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function GaugeChart(props: GaugeChartProps): React.ReactElement;
export default GaugeChart;
