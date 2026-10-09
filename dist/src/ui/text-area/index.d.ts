import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TextAreaProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    autoFocus?: boolean;
    /** 固定显示行数（非 autoSize 时决定盒高）；默认 3 */
    rows?: number;
    maxLength?: number;
    /** 随内容增高：true=不设限；{minRows,maxRows}=钳制区间 */
    autoSize?: boolean | {
        minRows?: number;
        maxRows?: number;
    };
    /** 右下角字数统计（配合 maxLength 显示 n / max） */
    showCount?: boolean;
    /** 聚焦且有值时右上角清除按钮 */
    allowClear?: boolean;
    status?: 'error' | 'warning';
    style?: StyleProp<ViewStyle>;
    onChange?: (v: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export declare function TextArea(props: TextAreaProps): React.ReactElement;
export default TextArea;
