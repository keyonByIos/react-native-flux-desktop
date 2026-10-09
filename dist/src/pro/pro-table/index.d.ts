import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type TableColumn } from '../../ui/table';
import type { SelectOption } from '../../ui/select';
/** 表格列：在 TableColumn 基础上追加 search 配置 */
export interface ProColumn<T = any> extends TableColumn<T> {
    /** 出现在筛选区；true = 文本模糊匹配 dataIndex 值 */
    search?: boolean | ((rowValue: any, filterValue: string) => boolean);
}
export interface ProFilterField {
    name: string;
    label?: string;
    type?: 'input' | 'select';
    options?: SelectOption[];
    placeholder?: string;
    /** input 框宽（默认 180） */
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
    /** 工具栏标题（左侧） */
    headerTitle?: React.ReactNode;
    /** 工具栏右侧操作区 */
    toolBarRender?: React.ReactNode;
    /** 额外筛选字段（columns[].search 之外） */
    filterFields?: ProFilterField[];
    /** 关掉整个筛选区 */
    search?: false;
    /** 异步模式：参数变化即回调，业务侧请求后回填 dataSource/total */
    request?: (params: ProTableRequestParams) => void;
    /** 异步模式的总条数（本地模式自动按过滤结果算） */
    total?: number;
    loading?: boolean;
    pageSize?: number;
    pagination?: boolean;
    /** 表格透传 */
    size?: 'large' | 'middle' | 'small';
    bordered?: boolean;
    striped?: boolean;
    onRowPress?: (row: T, index: number) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function ProTable<T = any>(props: ProTableProps<T>): React.ReactElement;
export default ProTable;
