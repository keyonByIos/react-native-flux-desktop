import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type RefLine } from '../core/common';
import type { GridConfig } from '../core/grid';
export interface ColumnChartProps {
    data: Record<string, any>[];
    xField: string;
    yField: string;
    seriesField?: string;
    color?: string | string[];
    height?: number;
    width?: number;
    stack?: boolean;
    /** 顶部圆角 */
    radius?: number;
    /** 数据标签：柱顶（堆叠时柱段内）显示数值 */
    label?: boolean;
    /** 柱宽上限（px）：类目少带宽大时柱不无限拉伸，在带内居中（antd maxColumnWidth 同款） */
    maxColumnWidth?: number;
    legend?: boolean;
    /** 悬浮提示 + 十字准星（默认开） */
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    /** 类目错峰占总时长的比例（0 则所有柱同时生长） */
    stagger?: number;
    yAxisFormatter?: (v: number) => string;
    xAxisFormatter?: (s: string) => string;
    /** 网格自定义（线色 / 虚实 / 线宽 / 纵向网格） */
    grid?: GridConfig;
    /** 横向参考线（阈值/目标）：虚线 + 右端标签，值会并入 y 轴域 */
    referenceLine?: RefLine[];
    style?: StyleProp<ViewStyle>;
}
export declare function ColumnChart(props: ColumnChartProps): React.ReactElement;
export default ColumnChart;
