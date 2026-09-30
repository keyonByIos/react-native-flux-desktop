import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface InputNumberProps {
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;

    suffix?: string;

    prefix?: React.ReactNode;

    placeholder?: string;

    size?: 'large' | 'middle' | 'small';

    status?: 'error' | 'warning';

    controls?: boolean;

    formatter?: (value: number) => string;
    style?: StyleProp<ViewStyle>;
    onChange?: (v: number | null) => void;
}
export declare function InputNumber(props: InputNumberProps): React.ReactElement;
export default InputNumber;
