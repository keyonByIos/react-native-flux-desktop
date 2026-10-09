import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TrendCardProps {
    /** 标的名称（如「比特币」） */
    name?: React.ReactNode;
    /** 代码 / 副标（如 BTC），右侧小标签 */
    symbol?: string;
    /** 现价 */
    price: number;
    /** 涨跌额（绝对值，正涨负跌）；缺省时由 price - prevClose 推 */
    change?: number;
    /** 涨跌幅（百分数值，如 +2.34）；缺省时由 change / prevClose 推 */
    changePercent?: number;
    /** 昨收（用于推涨跌 + 走势基线） */
    prevClose?: number;
    /** 货币前缀（如 ¥ / $） */
    prefix?: string;
    /** 小数位（默认 2） */
    precision?: number;
    /** 迷你走势数据（数值序列） */
    series?: number[];
    /** 涨色（默认红，A股习惯） */
    upColor?: string;
    /** 跌色（默认绿） */
    downColor?: string;
    /** 现价 count-up 动画 */
    animation?: boolean;
    /** 走势区高度 */
    sparkHeight?: number;
    onClick?: () => void;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}
export declare function TrendCard(props: TrendCardProps): React.ReactElement;
export default TrendCard;
