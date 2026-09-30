import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface StatCardTrend {

    direction: 'up' | 'down';

    value?: React.ReactNode;

    invert?: boolean;
}
export interface StatCardProps {
    title?: React.ReactNode;
    value?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    precision?: number;

    animation?: boolean;

    tag?: React.ReactNode;
    trend?: StatCardTrend;

    spark?: number[];
    loading?: boolean;

    onClick?: () => void;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}
export declare function StatCard(props: StatCardProps): React.ReactElement;
export interface StatisticGroupProps {
    items: StatCardProps[];

    itemWidth?: number;

    perRow?: number;
    style?: StyleProp<ViewStyle>;
}

export declare function StatisticGroup(props: StatisticGroupProps): React.ReactElement;
export default StatCard;
