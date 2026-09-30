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
    /** 高度三档 */
    size?: SelectSize;
    /** 校验状态 */
    status?: 'error' | 'warning';
    /** 弹出方向 */
    placement?: SelectPlacement;
    /** 多选时最多直接展示的标签数，超出折叠为 +N */
    maxTagCount?: number;
    /** 面板内联常驻展开（demo 用），不传则点触发器开合 */
    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (value: string[] | string) => void;
}
export declare function Select(props: SelectProps): React.ReactElement;
export {};
