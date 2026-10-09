import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface BulletProps {
    /** 每行一条子弹：{ [labelField]: 名称, [valueField]: 实际值, [targetField]: 目标值 } */
    data: Record<string, any>[];
    labelField?: string;
    valueField?: string;
    targetField?: string;
    /** 定性区间上界数组（升序），如 [60,80,100] → 3 段带；决定背景分块与量程 */
    ranges?: number[];
    /** 各段带颜色（长度 = ranges.length+1）；缺省用主色递增的浅→深灰 */
    rangeColors?: string[];
    /** 性能条颜色 */
    color?: string;
    /** 目标标记颜色 */
    targetColor?: string;
    /** 值轴上限（缺省取 max(ranges末, 各 value/target) 的 nice） */
    max?: number;
    height?: number;
    width?: number;
    /** 条高占行高比例 */
    barRatio?: number;
    /** 条上显示实际值 */
    label?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function BulletChart(props: BulletProps): React.ReactElement;
export default BulletChart;
