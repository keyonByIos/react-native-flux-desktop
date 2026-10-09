import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface InfiniteScrollProps {
    children?: React.ReactNode;
    /** 是否还有下一页；false 时 footer 显示「没有更多」 */
    hasMore: boolean;
    /** footer 接近视口底部时回调（一次接近只触发一次） */
    onLoadMore?: () => void;
    /** 加载中（由父级 fetch 状态控制，footer 显示转圈） */
    loading?: boolean;
    /** 上次加载失败：footer 显示错误文案 + 重试入口 */
    error?: boolean;
    /** 点击「重试」回调 */
    onRetry?: () => void;
    /** 触发加载的剩余滚动距离 / 视口高比例（默认 0.4） */
    threshold?: number;
    loadingText?: React.ReactNode;
    noMoreText?: React.ReactNode;
    errorText?: React.ReactNode;
    retryText?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
}
/**
 * 滚动容器 + 触底加载 + footer 状态机。须给出有界高度（flex:1 或固定高）。
 */
export declare function InfiniteScroll(props: InfiniteScrollProps): React.ReactElement;
export default InfiniteScroll;
