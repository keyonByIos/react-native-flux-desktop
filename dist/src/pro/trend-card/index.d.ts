import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TrendCardProps {

    name?: React.ReactNode;

    symbol?: string;

    price: number;

    change?: number;

    changePercent?: number;

    prevClose?: number;

    prefix?: string;

    precision?: number;

    series?: number[];

    upColor?: string;

    downColor?: string;

    animation?: boolean;

    sparkHeight?: number;
    onClick?: () => void;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}
export declare function TrendCard(props: TrendCardProps): React.ReactElement;
export default TrendCard;
