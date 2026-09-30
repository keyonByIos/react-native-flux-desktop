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

    sorter?: (a: T, b: T) => number;

    defaultSortOrder?: SortOrder;
}
export interface TableRowSelection<T = any> {
    type?: 'checkbox' | 'radio';
    selectedRowKeys: React.Key[];
    onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;

    getCheckboxProps?: (row: T) => {
        disabled?: boolean;
    };

    columnWidth?: number;
}
export interface TableProps<T = any> {
    columns: TableColumn<T>[];
    dataSource: T[];
    rowKey?: (row: T, index: number) => React.Key;

    size?: TableSize;

    striped?: boolean;

    bordered?: boolean;

    loading?: boolean;

    rowSelection?: TableRowSelection<T>;

    emptyText?: React.ReactNode;
    onRowPress?: (row: T, index: number) => void;

    onSorterChange?: (sortState: {
        columnKey: string;
        order: SortOrder;
    } | null) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Table<T = any>(props: TableProps<T>): React.ReactElement;
export default Table;
