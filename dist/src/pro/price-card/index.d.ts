import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PriceFeature {

    label: React.ReactNode;

    included?: boolean | 'plus';
}
export interface PriceCardProps {

    name?: React.ReactNode;

    description?: React.ReactNode;

    price?: React.ReactNode;

    currency?: React.ReactNode;

    period?: React.ReactNode;

    note?: React.ReactNode;

    features?: PriceFeature[];

    actionText?: React.ReactNode;

    onAction?: () => void;

    recommended?: boolean;

    badge?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function PriceCard(props: PriceCardProps): React.ReactElement;
export interface PriceTableProps {

    items: PriceCardProps[];

    itemWidth?: number;

    perRow?: number;
    style?: StyleProp<ViewStyle>;
}

export declare function PriceTable(props: PriceTableProps): React.ReactElement;
export default PriceCard;
