import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface BoxPlotProps {
    /** 每行 = 一个类目：{ [xField]: 类目名, [yField]: number[] 原始样本 } */
    data: Record<string, any>[];
    xField: string;
    /** 指向一个 number[] 字段的键 */
    yField: string;
    color?: string | string[];
    height?: number;
    width?: number;
    /** 显示均值标记（菱形点） */
    mean?: boolean;
    /** 显示离群点（默认开） */
    outliers?: boolean;
    /** 箱体填充透明度对应的十六进制后缀（默认 '33'） */
    boxOpacity?: string;
    legend?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    yAxisFormatter?: (v: number) => string;
    xAxisFormatter?: (s: string) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function BoxPlotChart(props: BoxPlotProps): React.ReactElement;
export default BoxPlotChart;
