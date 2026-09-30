import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type RadioValue = string | number;
type RadioSize = 'large' | 'middle' | 'small';
export interface RadioProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: React.ReactNode;

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

    __pos?: 'first' | 'last' | 'both' | 'none';
    __size?: RadioSize;
}

declare function ButtonRadio(props: RadioButtonProps): React.ReactElement;
export interface RadioGroupOption {
    label: React.ReactNode;
    value: RadioValue;
    disabled?: boolean;
}
export interface RadioGroupProps {
    value?: RadioValue;
    defaultValue?: RadioValue;

    options?: (RadioValue | RadioGroupOption)[];

    optionType?: 'radio' | 'button';

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
