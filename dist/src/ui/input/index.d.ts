import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { KeyMods } from '../../events/editable';
export interface InputProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    maxLength?: number;
    autoFocus?: boolean;
    size?: 'large' | 'middle' | 'small';
    status?: 'error' | 'warning';
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;

    allowClear?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (v: string) => void;
    onPressEnter?: (v: string) => void;

    onKeyDown?: (key: string, mods: KeyMods) => boolean | void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export declare function Input(props: InputProps): React.ReactElement;
export default Input;
