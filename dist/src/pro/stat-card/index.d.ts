import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface StatCardTrend {
    /** 趋势方向：up 绿 / down 红（invert 时反转语义），或跟随 raise 语义 */
    direction: 'up' | 'down';
    /** 趋势文案（如 "12.4%"） */
    value?: React.ReactNode;
    /** true = 上涨是坏事（如流失率），配色反转 */
    invert?: boolean;
}
export interface StatCardProps {
    title?: React.ReactNode;
    value?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    precision?: number;
    /** 数值 count-up（仅 number 生效） */
    animation?: boolean;
    /** 右上角自由角标（如 "今日"） */
    tag?: React.ReactNode;
    trend?: StatCardTrend;
    /** 迷你柱条数据（如近 7 日走势） */
    spark?: number[];
    loading?: boolean;
    /** 整卡可点（桌面端统一 onClick；onPress 为等价别名） */
    onClick?: () => void;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}
export declare function StatCard(props: StatCardProps): React.ReactElement;
export interface StatisticGroupProps {
    items: StatCardProps[];
    /** 单卡宽度（缺省等分：传 gap 容器 flex 排布） */
    itemWidth?: number;
    /** 每行最多卡数，超出自动分行（默认 4）。勿改回 flexWrap：本 Yoga 构建下 wrap 行内 flex:1 项会排到画布外丢画 */
    perRow?: number;
    style?: StyleProp<ViewStyle>;
}
/** 指标卡组：每行最多 perRow 张等分，超量按行分组；末行补空位保持卡宽一致 */
export declare function StatisticGroup(props: StatisticGroupProps): React.ReactElement;
export default StatCard;
