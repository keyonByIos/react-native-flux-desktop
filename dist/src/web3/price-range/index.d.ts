import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { TokenMeta } from '../token-price';
export interface PriceRangeProps {
    token: TokenMeta | string;
    min: number;
    max: number;

    precision?: number;

    label?: string;

    showBar?: boolean;

    barWidth?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function PriceRange(props: PriceRangeProps): React.ReactElement;
export default PriceRange;
