import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type RadioValue = string | number;
type RadioSize = 'large' | 'middle' | 'small';
export interface RadioProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: React.ReactNode;
    /** 在 Radio.Group 内使用时的值 */
    value?: RadioValue;
    onChange?: (checked: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export interface RadioButtonProps {
    checked?: boolean;
    disabled?: boolean;
    label?: React.ReactNode;
    value?: RadioValue;
    onChange?: (checked: boolean) => void;
    style?: StyleProp<ViewStyle>;
    /** 组内位置：决定两端圆角（first/last/none 由 Group 计算） */
    __pos?: 'first' | 'last' | 'both' | 'none';
    __size?: RadioSize;
}
/** 按钮风格单选框 */
declare function ButtonRadio(props: RadioButtonProps): React.ReactElement;
export interface RadioGroupOption {
    label: React.ReactNode;
    value: RadioValue;
    disabled?: boolean;
}
export interface RadioGroupProps {
    value?: RadioValue;
    defaultValue?: RadioValue;
    /** 选项简写：字符串/数字或 {label,value,disabled} */
    options?: (RadioValue | RadioGroupOption)[];
    /** radio（圆点，默认）/ button（按钮风格） */
    optionType?: 'radio' | 'button';
    /** 按钮风格尺寸 */
    size?: RadioSize;
    disabled?: boolean;
    onChange?: (value: RadioValue) => void;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function Group(props: RadioGroupProps): React.ReactElement;
declare function RadioBase(props: RadioProps): React.ReactElement;
export declare const Radio: typeof RadioBase & {
    Group: typeof Group;
    Button: typeof ButtonRadio;
};
export default Radio;
