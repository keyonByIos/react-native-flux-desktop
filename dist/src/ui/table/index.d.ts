import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type SortOrder = 'ascend' | 'descend';
export type TableSize = 'large' | 'middle' | 'small';
export interface TableColumn<T = any> {
    title: React.ReactNode;
    dataIndex?: keyof T | string;
    key?: string;
    width?: number | `${number}%`;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T, index: number) => React.ReactNode;
    /** 比较函数：提供后该列表头可点击排序 */
    sorter?: (a: T, b: T) => number;
    /** 默认排序方向 */
    defaultSortOrder?: SortOrder;
}
export interface TableRowSelection<T = any> {
    type?: 'checkbox' | 'radio';
    selectedRowKeys: React.Key[];
    onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
    /** 单行是否禁用选择 */
    getCheckboxProps?: (row: T) => {
        disabled?: boolean;
    };
    /** 全选列宽（px）。默认 48 */
    columnWidth?: number;
}
export interface TableProps<T = any> {
    columns: TableColumn<T>[];
    dataSource: T[];
    rowKey?: (row: T, index: number) => React.Key;
    /** 密度：large（默认）/ middle / small */
    size?: TableSize;
    /** 斑马纹 */
    striped?: boolean;
    /** 显示外框与单元格线（antd bordered） */
    bordered?: boolean;
    /** 加载中遮罩 */
    loading?: boolean;
    /** 行选择（checkbox / radio） */
    rowSelection?: TableRowSelection<T>;
    /** 空数据文案 */
    emptyText?: React.ReactNode;
    onRowPress?: (row: T, index: number) => void;
    /** 排序变化回调 */
    onSorterChange?: (sortState: {
        columnKey: string;
        order: SortOrder;
    } | null) => void;
    /** 虚拟化：仅渲染视口内 ±overscan 行（万行级）。开启时表头固定、表体走 VirtualList（行等高，需 itemHeight） */
    virtual?: boolean;
    /** 虚拟化表体视口高（px）；缺省 flex:1（由外层给界） */
    virtualHeight?: number;
    /** 虚拟化行高（px）；缺省按密度自动估算（padV*2 + 行高） */
    itemHeight?: number;
    /** 虚拟化视口外上下各多渲染行数，默认 6 */
    overscan?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Table<T = any>(props: TableProps<T>): React.ReactElement;
export default Table;
