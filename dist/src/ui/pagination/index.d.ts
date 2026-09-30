import React from 'react';
import { StyleProp, ViewStyle } from '../../types';

export type PaginationItemType = 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next';
export interface PaginationProps {
    current?: number;
    defaultCurrent?: number;
    total?: number;
    pageSize?: number;
    defaultPageSize?: number;

    onChange?: (page: number, pageSize: number) => void;

    simple?: boolean;
    disabled?: boolean;

    size?: 'default' | 'small';
    hideOnSinglePage?: boolean;

    showTotal?: (total: number, range: [number, number]) => React.ReactNode;

    itemRender?: (page: number, type: PaginationItemType, element: React.ReactNode) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Pagination(props: PaginationProps): React.ReactElement;
export default Pagination;
