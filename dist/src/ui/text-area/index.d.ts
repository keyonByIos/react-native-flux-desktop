import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TextAreaProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    autoFocus?: boolean;

    rows?: number;
    maxLength?: number;

    autoSize?: boolean | {
        minRows?: number;
        maxRows?: number;
    };

    showCount?: boolean;

    allowClear?: boolean;
    status?: 'error' | 'warning';
    style?: StyleProp<ViewStyle>;
    onChange?: (v: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export declare function TextArea(props: TextAreaProps): React.ReactElement;
export default TextArea;
