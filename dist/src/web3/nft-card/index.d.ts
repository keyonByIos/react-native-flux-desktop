import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type TokenMeta } from '../token-price';
export interface NFTCardProps {

    name: string;

    collection?: string;

    standard?: string;

    contract?: string;

    tokenId?: string | number;

    image?: string | React.ReactNode;

    coverHeight?: number;

    price?: {
        token: TokenMeta | string;
        amount: number;
        fiatPrice?: number;
    };

    priceLabel?: string;

    chain?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function NFTCard(props: NFTCardProps): React.ReactElement;
export default NFTCard;
