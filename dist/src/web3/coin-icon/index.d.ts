import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CoinIconProps {

    symbol: string;

    size?: number;

    shape?: 'plain' | 'circle' | 'square';

    bg?: string;

    style?: StyleProp<ViewStyle>;
}
export declare function CoinIcon(props: CoinIconProps): React.ReactElement;
export default CoinIcon;
