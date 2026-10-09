import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { TokenMeta } from '../token-price';
export interface PriceRangeProps {
    token: TokenMeta | string;
    min: number;
    max: number;
    /** 小数位。默认 4 */
    precision?: number;
    /** 标题（如「地板价区间」） */
    label?: string;
    /** 是否绘制迷你区间轨 */
    showBar?: boolean;
    /** 轨条宽度（px）。默认 200 */
    barWidth?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function PriceRange(props: PriceRangeProps): React.ReactElement;
export default PriceRange;
