import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface InfiniteScrollProps {
    children?: React.ReactNode;

    hasMore: boolean;

    onLoadMore?: () => void;

    loading?: boolean;

    error?: boolean;

    onRetry?: () => void;

    threshold?: number;
    loadingText?: React.ReactNode;
    noMoreText?: React.ReactNode;
    errorText?: React.ReactNode;
    retryText?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

export declare function InfiniteScroll(props: InfiniteScrollProps): React.ReactElement;
export default InfiniteScroll;
