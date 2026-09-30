import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DropdownItem {
    key: string;
    label?: React.ReactNode;
    icon?: React.ReactNode | string;
    danger?: boolean;
    disabled?: boolean;
    type?: 'item' | 'divider';
    /** 子菜单（antd MenuItem.children）：点击父项行内展开一层 */
    children?: DropdownItem[];
}
export interface DropdownMenuProps {
    items: DropdownItem[];
    /** 点击菜单项回调：info 携带 key 与 keyPath（父链在前） */
    onClick?: (key: string, info: {
        key: string;
        keyPath: string[];
    }) => void;
    selectable?: boolean;
    selectedKeys?: string[];
    /** 整个菜单禁用（antd menu.disabled） */
    disabled?: boolean;
}
export interface DropdownProps {
    menu: DropdownMenuProps;
    children: React.ReactNode;
    trigger?: 'click' | 'hover';
    placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
    open?: boolean;
    disabled?: boolean;
    /** 面板边缘箭头（antd arrow） */
    arrow?: boolean;
    style?: StyleProp<ViewStyle>;
    onOpenChange?: (open: boolean) => void;
}
declare function DropdownBase(props: DropdownProps): React.ReactElement;
/** Dropdown.Button：左主按钮 + 右下拉区无缝拼接的复合按钮（antd 同名组件） */
export interface DropdownButtonProps extends Omit<DropdownProps, 'children'> {
    /** 左侧主按钮文字 */
    buttons?: React.ReactNode;
    /** 左侧主按钮点击 */
    onClick?: () => void;
    /** 左侧按钮 type（默认 default） */
    type?: 'primary' | 'default';
}
declare function DropdownButtonBase(props: DropdownButtonProps): React.ReactElement;
export declare const Dropdown: typeof DropdownBase & {
    Button: typeof DropdownButtonBase;
};
export default Dropdown;
