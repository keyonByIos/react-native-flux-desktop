import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface ProDescriptionColumn<T = any> {
    label: React.ReactNode;
    dataIndex: keyof T & string;
    span?: number;
    valueType?: 'text' | 'copy' | 'link' | 'badge' | 'date';

    badgeColor?: ((value: any, row: T) => string | undefined) | Record<string, string> | string;

    render?: (value: any, row: T) => React.ReactNode;
}
export interface ProDescriptionsProps<T = any> {
    title?: React.ReactNode;
    extra?: React.ReactNode;
    columns: ProDescriptionColumn<T>[];

    data?: T;

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
