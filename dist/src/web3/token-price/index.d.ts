import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TokenMeta {
    symbol: string;
    name?: string;

    icon?: React.ReactNode;
}
export interface TokenPriceProps {

    token: TokenMeta | string;

    amount: number;

    fiatPrice?: number;

    change?: number;

    precision?: number;

    fiatPrefix?: string;

    invert?: boolean;
    size?: 'small' | 'middle' | 'large';
    style?: StyleProp<ViewStyle>;
}
export declare function TokenPrice(props: TokenPriceProps): React.ReactElement;
export default TokenPrice;
