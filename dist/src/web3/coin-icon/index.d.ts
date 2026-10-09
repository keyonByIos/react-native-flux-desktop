import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CoinIconProps {
    /** 币种：ticker 或名称（BTC/ETH/SOL/…，大小写不敏感，含常见别名） */
    symbol: string;
    /** 边长（px）。默认 24 */
    size?: number;
    /** 外形：plain 只画图形（币种自带轮廓）；circle / square 加圆/方底牌并裁切 */
    shape?: 'plain' | 'circle' | 'square';
    /** circle / square 底牌背景色；默认 colorBgContainer */
    bg?: string;
    /** 额外样式（margin 等） */
    style?: StyleProp<ViewStyle>;
}
export declare function CoinIcon(props: CoinIconProps): React.ReactElement;
export default CoinIcon;
