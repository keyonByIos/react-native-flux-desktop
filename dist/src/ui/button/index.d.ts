import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonShape = 'default' | 'circle' | 'round';
export interface ButtonProps {
    type?: ButtonType;
    size?: ButtonSize;

    shape?: ButtonShape;
    danger?: boolean;
    disabled?: boolean;
    block?: boolean;

    ghost?: boolean;

    color?: string;

    loading?: boolean;
    onPress?: () => void;

    onClick?: () => void;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Button(props: ButtonProps): React.ReactElement;
