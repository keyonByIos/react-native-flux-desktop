import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PriceFeature {
    /** 权益文案 */
    label: React.ReactNode;
    /** true=已包含（打勾绿）；false=不含（打叉灰）；'plus'=加号（可选增值） */
    included?: boolean | 'plus';
}
export interface PriceCardProps {
    /** 方案名（如「专业版」） */
    name?: React.ReactNode;
    /** 副描述（一句话卖点） */
    description?: React.ReactNode;
    /** 价格数值（纯展示，字符串原样、数字加千分位） */
    price?: React.ReactNode;
    /** 币种前缀（如 ¥ / $） */
    currency?: React.ReactNode;
    /** 周期后缀（如 /月、/年），紧跟价格小字 */
    period?: React.ReactNode;
    /** 价格下方补充说明（如「按年计费，省 20%」） */
    note?: React.ReactNode;
    /** 权益清单 */
    features?: PriceFeature[];
    /** CTA 文案 */
    actionText?: React.ReactNode;
    /** CTA 点击 */
    onAction?: () => void;
    /** 推荐方案：主色描边 + 顶部角标 + 主色按钮 */
    recommended?: boolean;
    /** 推荐角标文案（默认「推荐」） */
    badge?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function PriceCard(props: PriceCardProps): React.ReactElement;
export interface PriceTableProps {
    /** 一组方案（并排等分） */
    items: PriceCardProps[];
    /** 每张卡固定宽（缺省按 perRow 等分） */
    itemWidth?: number;
    /** 每行最多卡数，超出自动分行（默认 4）。勿改回 flexWrap：本 Yoga 构建下 wrap 行内 flex:1 项会排到画布外丢画 */
    perRow?: number;
    style?: StyleProp<ViewStyle>;
}
/** 方案卡组：每行最多 perRow 张等分等高，超量按行分组；末行补空位保持卡宽对齐。
 *  等高靠行容器 alignItems:stretch 直接把卡片盒拉伸到行高（行高=同行最高卡内容），
 *  勿用 height:'100%'——在 ScrollView 内本 Yoga 会把 100% 解析到定高滚动视口，致卡片被拉到整屏高。 */
export declare function PriceTable(props: PriceTableProps): React.ReactElement;
export default PriceCard;
