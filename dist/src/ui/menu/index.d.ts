import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
/** 菜单项。icon 传字符串走矢量图标并跟随选中色；也接受任意 ReactNode。 */
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
    /** 目前仅 inline 落地（就地展开）；vertical/horizontal 需浮层层，后续补。 */
    mode?: 'inline' | 'vertical';
    theme?: 'light' | 'dark';
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    openKeys?: string[];
    defaultOpenKeys?: string[];
    inlineIndent?: number;
    /** 手风琴模式：仅对根级子菜单互斥（展开一个自动收起其余根级及其后代）；深层子菜单不受限。需配合非受控 openKeys 或自行同步 onOpenChange。 */
    accordion?: boolean;
    onClick?: (info: MenuInfo) => void;
    onSelect?: (info: MenuInfo) => void;
    onOpenChange?: (openKeys: string[]) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Menu(props: MenuProps): React.ReactElement;
