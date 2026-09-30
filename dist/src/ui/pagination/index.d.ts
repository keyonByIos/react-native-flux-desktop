import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
/** itemRender 的节点类型 */
export type PaginationItemType = 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next';
export interface PaginationProps {
    current?: number;
    defaultCurrent?: number;
    total?: number;
    pageSize?: number;
    defaultPageSize?: number;
    /** 页码或每页条数变化（本组件无 sizeChanger，pageSize 恒等传入值） */
    onChange?: (page: number, pageSize: number) => void;
    /** 简洁模式：仅 上一页 / x / y / 下一页 */
    simple?: boolean;
    disabled?: boolean;
    /** 迷你尺寸 */
    size?: 'default' | 'small';
    hideOnSinglePage?: boolean;
    /** 展示总条数与当前范围 */
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
    /** 自定义页码 / 前后箭头 / 省略号节点 */
    itemRender?: (page: number, type: PaginationItemType, element: React.ReactNode) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Pagination(props: PaginationProps): React.ReactElement;
export default Pagination;
