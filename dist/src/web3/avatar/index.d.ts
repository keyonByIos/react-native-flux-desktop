import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface Web3AvatarProps {
    /** 种子：钱包地址或任意字符串；同值恒得同图 */
    address: string;
    /** 边长（px）。默认 controlHeightLG（40） */
    size?: number;
    shape?: 'circle' | 'square';
    /** 网格边长（格数）。默认 8 */
    grid?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Web3Avatar(props: Web3AvatarProps): React.ReactElement;
export default Web3Avatar;
