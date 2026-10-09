import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface InputNumberProps {
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    /** 后缀单位文字 */
    suffix?: string;
    /** 前缀（值左侧） */
    prefix?: React.ReactNode;
    /** 无值时占位文字 */
    placeholder?: string;
    /** 高度三档 */
    size?: 'large' | 'middle' | 'small';
    /** 校验状态 */
    status?: 'error' | 'warning';
    /** 是否显示步进按钮（默认 true） */
    controls?: boolean;
    /** 自定义数值显示 */
    formatter?: (value: number) => string;
    style?: StyleProp<ViewStyle>;
    onChange?: (v: number | null) => void;
}
export declare function InputNumber(props: InputNumberProps): React.ReactElement;
export default InputNumber;
