import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface FloatButtonProps {
    icon?: React.ReactNode | string;

    description?: React.ReactNode;

    text?: React.ReactNode;
    badge?: React.ReactNode | number;
    type?: 'default' | 'primary';
    shape?: 'circle' | 'square';
    size?: number;

    onClick?: () => void;

    onPress?: () => void;

    tooltip?: string;

    title?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function FloatButtonBase(props: FloatButtonProps): React.ReactElement;
export interface FloatButtonGroupProps {
    children?: React.ReactNode;
    shape?: 'circle' | 'square';

    trigger?: 'click' | 'hover';

    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;

    icon?: React.ReactNode | string;

    closeIcon?: React.ReactNode | string;
    style?: StyleProp<ViewStyle>;
}
export declare function Group(props: FloatButtonGroupProps): React.ReactElement;

export declare const FloatButton: typeof FloatButtonBase & {
    Group: typeof Group;
};
export default FloatButton;
