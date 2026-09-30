import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface BreadcrumbItem {
    title: React.ReactNode;
    /** 传入即视为可点（配合 onClick） */
    href?: string;
    onClick?: () => void;
    /** 覆盖该项之后的分隔符（全局 separator 的单项覆写） */
    separator?: React.ReactNode;
}
export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    /** 自定义每一项的渲染（antd itemRender），返回节点替换默认文本/链接 */
    itemRender?: (item: BreadcrumbItem, params: Record<string, string>, items: BreadcrumbItem[], index: number) => React.ReactNode;
    /** 透传给 itemRender 的参数（如路由 path 片段） */
    params?: Record<string, string>;
    style?: StyleProp<ViewStyle>;
}
export declare function Breadcrumb(props: BreadcrumbProps): React.ReactElement;
export default Breadcrumb;
