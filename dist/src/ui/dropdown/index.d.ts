import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DropdownItem {
    key: string;
    label?: React.ReactNode;
    icon?: React.ReactNode | string;
    danger?: boolean;
    disabled?: boolean;
    type?: 'item' | 'divider';

    children?: DropdownItem[];
}
export interface DropdownMenuProps {
    items: DropdownItem[];

    onClick?: (key: string, info: {
        key: string;
        keyPath: string[];
    }) => void;
    selectable?: boolean;
    selectedKeys?: string[];

    disabled?: boolean;
}
export interface DropdownProps {
    menu: DropdownMenuProps;
    children: React.ReactNode;
    trigger?: 'click' | 'hover';
    placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
    open?: boolean;
    disabled?: boolean;

    arrow?: boolean;
    style?: StyleProp<ViewStyle>;
    onOpenChange?: (open: boolean) => void;
}
declare function DropdownBase(props: DropdownProps): React.ReactElement;

export interface DropdownButtonProps extends Omit<DropdownProps, 'children'> {

    buttons?: React.ReactNode;

    onClick?: () => void;

    type?: 'primary' | 'default';
}
declare function DropdownButtonBase(props: DropdownButtonProps): React.ReactElement;
export declare const Dropdown: typeof DropdownBase & {
    Button: typeof DropdownButtonBase;
};
export default Dropdown;
