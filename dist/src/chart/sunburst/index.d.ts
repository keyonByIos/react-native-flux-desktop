import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type SunburstNode } from '../core/sunburst';
export interface SunburstChartProps {
    /** 层级树根（value 或后代叶子聚合；根本身作中心洞不画） */
    data: SunburstNode;
    /** 直径 */
    size?: number;
    /** 中心洞半径比例（0..0.6） */
    innerRadius?: number;
    /** 最多渲染环数（1 = 仅顶层分支环） */
    maxDepth?: number;
    /** 弧间隙角（度） */
    padAngle?: number;
    /** 分支色覆盖（单色串 / 色板数组） */
    color?: string | string[];
    /** 顶层分支图例（可点击切换显隐） */
    legend?: boolean;
    /** 数据标签：顶层分支占比（弧足够大时画于外缘） */
    label?: boolean;
    animation?: boolean;
    animateDuration?: number;
    centerTitle?: string;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function SunburstChart(props: SunburstChartProps): React.ReactElement;
export default SunburstChart;
