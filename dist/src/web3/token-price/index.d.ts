import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TokenMeta {
    symbol: string;
    name?: string;
    /** 自定义图标节点；给了就替代字母徽标 */
    icon?: React.ReactNode;
}
export interface TokenPriceProps {
    /** 代币：传 symbol 字符串或 {symbol,name,icon} */
    token: TokenMeta | string;
    /** 持有 / 展示 的代币数量 */
    amount: number;
    /** 单价（法币），给了则展示法币估值 = amount * fiatPrice */
    fiatPrice?: number;
    /** 涨跌幅（百分数，如 3.21 表示 +3.21%） */
    change?: number;
    /** 数量小数位。默认 4 */
    precision?: number;
    /** 法币前缀符号。默认 '$' */
    fiatPrefix?: string;
    /** 涨跌配色：默认涨绿跌红；invert=true 涨红跌绿（A 股习惯） */
    invert?: boolean;
    size?: 'small' | 'middle' | 'large';
    style?: StyleProp<ViewStyle>;
}
export declare function TokenPrice(props: TokenPriceProps): React.ReactElement;
export default TokenPrice;
