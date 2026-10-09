import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from '../../types';
/** 水平对齐档位 */
export type StatisticAlign = 'left' | 'center' | 'right';
export interface StatisticProps {
    title?: React.ReactNode;
    value?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    /** 数值入场动画（仅对 number 类型 value 生效） */
    animation?: boolean;
    /** 千分位分隔符，默认 ','；传 false 关闭 */
    groupSeparator?: string | false;
    /** 小数位数（仅对 number 生效） */
    precision?: number;
    /** 加载态：以占位块代替数值 */
    loading?: boolean;
    /** 自定义格式化（优先于内置千分位/precision） */
    formatter?: (value: React.ReactNode) => React.ReactNode;
    /** 标题水平对齐，默认 'right' */
    titleAlign?: StatisticAlign;
    /** 数值（含前后缀）水平对齐，默认 'left' */
    valueAlign?: StatisticAlign;
    valueStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
}
export declare function Statistic(props: StatisticProps): React.ReactElement;
