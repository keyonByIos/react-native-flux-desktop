import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface InputOTPProps {

    length?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;

    onComplete?: (v: string) => void;

    masked?: boolean;
    disabled?: boolean;

    status?: 'error' | 'warning';

    direction?: 'horizontal' | 'vertical';
    style?: StyleProp<ViewStyle>;
}
export declare function InputOTP(props: InputOTPProps): React.ReactElement;
export default InputOTP;
