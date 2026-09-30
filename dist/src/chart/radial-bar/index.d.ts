import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RadialBarProps {
    /** 每项一个环：{ [nameField]: 名称, [valueField]: 数值 } */
    data: Record<string, any>[];
    nameField?: string;
    valueField?: string;
    /** 全局上限（项无 maxField 时用）；默认取各项最大值 */
    max?: number;
    /** 每项独立上限的字段（优先级高于全局 max） */
    maxField?: string;
    /** 画布直径 */
    size?: number;
    /** 色板或单色 */
    color?: string | string[];
    /** 中心标题（缺省悬停图例时显该项名） */
    centerTitle?: string;
    /** 图例（右侧名称 + 数值 + 占比行），默认开 */
    legend?: boolean;
    animation?: boolean;
    animateDuration?: number;
    formatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function RadialBarChart(props: RadialBarProps): React.ReactElement;
export default RadialBarChart;
