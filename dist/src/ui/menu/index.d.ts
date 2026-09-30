import React from 'react';
import { StyleProp, ViewStyle } from '../../types';

export interface MenuItem {
    key: string;
    label?: React.ReactNode;
    icon?: React.ReactNode | string;
    disabled?: boolean;
    danger?: boolean;
    children?: MenuItem[];
    type?: 'item' | 'submenu' | 'group' | 'divider';
}
export interface MenuInfo {
    key: string;
    keyPath: string[];
}
export interface MenuProps {
    items: MenuItem[];

    mode?: 'inline' | 'vertical';
    theme?: 'light' | 'dark';
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    openKeys?: string[];
    defaultOpenKeys?: string[];
    inlineIndent?: number;

    accordion?: boolean;
    onClick?: (info: MenuInfo) => void;
    onSelect?: (info: MenuInfo) => void;
    onOpenChange?: (openKeys: string[]) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Menu(props: MenuProps): React.ReactElement;
