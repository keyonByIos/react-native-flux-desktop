import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface BreadcrumbItem {
    title: React.ReactNode;

    href?: string;
    onClick?: () => void;

    separator?: React.ReactNode;
}
export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;

    itemRender?: (item: BreadcrumbItem, params: Record<string, string>, items: BreadcrumbItem[], index: number) => React.ReactNode;

    params?: Record<string, string>;
    style?: StyleProp<ViewStyle>;
}
export declare function Breadcrumb(props: BreadcrumbProps): React.ReactElement;
export default Breadcrumb;
