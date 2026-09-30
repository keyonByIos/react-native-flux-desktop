import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface RangeBarProps {
    /** 每行 = 一个类目：{ [yField]: 类目名, [startField]: number, [endField]: number, [colorField]?: any } */
    data: Record<string, any>[];
    yField: string;
    startField: string;
    endField: string;
    /** 单色 / 色板；给定 colorField 时按该字段分色 */
    color?: string | string[];
    /** 按此字段取值分色（缺省按行序号取色板） */
    colorField?: string;
    height?: number;
    width?: number;
    /** 条高占带高比例（0..1） */
    barRatio?: number;
    /** 条上显示区间文本 */
    label?: boolean;
    /** 圆角端 */
    radius?: number;
    legend?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    xAxisFormatter?: (v: number) => string;
    yAxisFormatter?: (s: string) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function RangeBarChart(props: RangeBarProps): React.ReactElement;
export default RangeBarChart;
