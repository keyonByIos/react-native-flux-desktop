import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SelectOption {
    label: React.ReactNode;
    value: string;
    disabled?: boolean;
}
type SelectSize = 'large' | 'middle' | 'small';
type SelectPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export interface SelectProps {
    options: SelectOption[];
    value?: string[] | string;
    defaultValue?: string[] | string;
    mode?: 'multiple';
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;

    size?: SelectSize;

    status?: 'error' | 'warning';

    placement?: SelectPlacement;

    maxTagCount?: number;

    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (value: string[] | string) => void;
}
export declare function Select(props: SelectProps): React.ReactElement;
export {};
