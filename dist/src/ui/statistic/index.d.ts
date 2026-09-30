import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from '../../types';
export interface StatisticProps {
    title?: React.ReactNode;
    value?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;

    animation?: boolean;

    groupSeparator?: string | false;

    precision?: number;

    loading?: boolean;

    formatter?: (value: React.ReactNode) => React.ReactNode;
    valueStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
}
export declare function Statistic(props: StatisticProps): React.ReactElement;
