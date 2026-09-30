import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface Web3AvatarProps {

    address: string;

    size?: number;
    shape?: 'circle' | 'square';

    grid?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Web3Avatar(props: Web3AvatarProps): React.ReactElement;
export default Web3Avatar;
