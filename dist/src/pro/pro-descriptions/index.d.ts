import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface ProDescriptionColumn<T = any> {
    label: React.ReactNode;
    dataIndex: keyof T & string;
    span?: number;
    valueType?: 'text' | 'copy' | 'link' | 'badge' | 'date';
    /** 语义点颜色（badge 用）：按值映射或直接色值 */
    badgeColor?: ((value: any, row: T) => string | undefined) | Record<string, string> | string;
    /** 覆盖内置渲染 */
    render?: (value: any, row: T) => React.ReactNode;
}
export interface ProDescriptionsProps<T = any> {
    title?: React.ReactNode;
    extra?: React.ReactNode;
    columns: ProDescriptionColumn<T>[];
    /** 受控数据；不传则用 request 拉取 */
    data?: T;
    /** 异步加载：挂载（及 reloadKey 变化）时调用 */
    request?: () => Promise<T>;
    reloadKey?: React.Key;
    loading?: boolean;
    column?: number;
    bordered?: boolean;
    layout?: 'horizontal' | 'vertical';
    style?: StyleProp<ViewStyle>;
}
export declare function ProDescriptions<T extends Record<string, any> = any>(props: ProDescriptionsProps<T>): React.ReactElement;
export default ProDescriptions;
