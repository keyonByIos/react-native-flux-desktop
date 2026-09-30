import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type FormLayout = 'horizontal' | 'vertical' | 'inline';
export interface FormRule {
    required?: boolean;

    pattern?: RegExp;

    min?: number;
    max?: number;
    message?: string;

    validator?: (v: any) => boolean | string | undefined | Promise<boolean | string | undefined>;
}
export interface FormProps {
    children: React.ReactNode;
    layout?: FormLayout;

    labelWidth?: number;
    initialValues?: Record<string, any>;
    onFinish?: (values: Record<string, any>) => void;
    onFinishFailed?: (errors: Record<string, string>) => void;
    style?: StyleProp<ViewStyle>;
}
declare function FormComp(props: FormProps): React.ReactElement;
export interface FormItemProps {
    label?: React.ReactNode;
    name?: string;
    rules?: FormRule[];

    required?: boolean;

    help?: React.ReactNode;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function FormItem(props: FormItemProps): React.ReactElement;

declare function FormSubmit(props: {
    text?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}): React.ReactElement;
export declare const Form: typeof FormComp & {
    Item: typeof FormItem;
    Submit: typeof FormSubmit;
};
export default Form;
