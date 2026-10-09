import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface ViolinProps {
    /** 每行 = 一个类目：{ [xField]: 类目名, [yField]: number[] 原始样本 } */
    data: Record<string, any>[];
    xField: string;
    /** 指向一个 number[] 字段的键 */
    yField: string;
    color?: string | string[];
    height?: number;
    width?: number;
    /** 内嵌迷你箱（IQR 盒 + 中位线 + 须线），默认开 */
    box?: boolean;
    /** 显示均值点 */
    mean?: boolean;
    /** KDE 带宽（不给走 Silverman 经验法则） */
    bandwidth?: number;
    /** 轮廓填充透明度后缀（十六进制） */
    fillOpacity?: string;
    legend?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    yAxisFormatter?: (v: number) => string;
    xAxisFormatter?: (s: string) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function ViolinChart(props: ViolinProps): React.ReactElement;
export default ViolinChart;
