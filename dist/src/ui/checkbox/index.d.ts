import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
type CheckValue = string | number;
export interface CheckboxProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: React.ReactNode;

    indeterminate?: boolean;

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
