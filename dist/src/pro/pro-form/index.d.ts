import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type ProFormFieldType = 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'switch' | 'custom';
export interface ProFormRule {
    required?: boolean;

    requiredMessage?: string;

    pattern?: RegExp;
    min?: number;
    max?: number;

    message?: string;

    validator?: (value: any, values: ProFormValues) => string | null | undefined;
}
export interface ProFormField {

    name: string;
    label?: string;
    type?: ProFormFieldType;

    fieldProps?: Record<string, any>;
    rules?: ProFormRule[];

    tooltip?: string;

    span?: number;
    disabled?: boolean;

    render?: (value: any, values: ProFormValues) => React.ReactNode;

    initialValue?: any;
}
export type ProFormValues = Record<string, any>;

export interface ProFormActions {
    reset: () => void;
    clearValidate: () => void;
    setValues: (patch: ProFormValues) => void;
    validate: () => boolean;
}
export interface ProFormProps {
    fields: ProFormField[];
    title?: string;

    columns?: number;

    gap?: number;
    values?: ProFormValues;
    defaultValue?: ProFormValues;
    onValuesChange?: (patch: ProFormValues, all: ProFormValues) => void;

    onFinish?: (values: ProFormValues) => void | Promise<void>;
    onFinishFailed?: (errors: Record<string, string>) => void;

    submitter?: false | {
        resetText?: string;
        submitText?: string;
    };

    actions?: React.MutableRefObject<ProFormActions | null>;
    style?: StyleProp<ViewStyle>;
}
export declare function ProForm(props: ProFormProps): React.ReactElement;
export default ProForm;
