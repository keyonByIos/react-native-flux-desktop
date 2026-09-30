import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
type CheckValue = string | number;
export interface CheckboxProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: React.ReactNode;
    /** 半选状态：未选中时框内显示横杠（多用于全选） */
    indeterminate?: boolean;
    /** 在 Checkbox.Group 内使用时的值 */
    value?: CheckValue;
    onChange?: (checked: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
declare function CheckboxBase(props: CheckboxProps): React.ReactElement;
export interface CheckboxGroupOption {
    label: React.ReactNode;
    value: CheckValue;
    disabled?: boolean;
}
export interface CheckboxGroupProps {
    value?: CheckValue[];
    defaultValue?: CheckValue[];
    /** 选项简写：字符串/数字或 {label,value,disabled} */
    options?: (CheckValue | CheckboxGroupOption)[];
    disabled?: boolean;
    onChange?: (checkedValue: CheckValue[]) => void;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function Group(props: CheckboxGroupProps): React.ReactElement;
export declare const Checkbox: typeof CheckboxBase & {
    Group: typeof Group;
};
export default Checkbox;
