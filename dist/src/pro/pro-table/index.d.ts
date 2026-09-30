import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type TableColumn } from '../../ui/table';
import type { SelectOption } from '../../ui/select';

export interface ProColumn<T = any> extends TableColumn<T> {

    search?: boolean | ((rowValue: any, filterValue: string) => boolean);
}
export interface ProFilterField {
    name: string;
    label?: string;
    type?: 'input' | 'select';
    options?: SelectOption[];
    placeholder?: string;

    width?: number;
}
export interface ProTableRequestParams {
    page: number;
    pageSize: number;
    filters: Record<string, string>;
}
export interface ProTableProps<T = any> {
    columns: ProColumn<T>[];
    dataSource: T[];
    rowKey?: (row: T, index: number) => React.Key;

    headerTitle?: React.ReactNode;

    toolBarRender?: React.ReactNode;

    filterFields?: ProFilterField[];

    search?: false;

    request?: (params: ProTableRequestParams) => void;

    total?: number;
    loading?: boolean;
    pageSize?: number;
    pagination?: boolean;

    size?: 'large' | 'middle' | 'small';
    bordered?: boolean;
    striped?: boolean;
    onRowPress?: (row: T, index: number) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function ProTable<T = any>(props: ProTableProps<T>): React.ReactElement;
export default ProTable;
