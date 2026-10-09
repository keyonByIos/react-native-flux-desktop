import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type FormLayout = 'horizontal' | 'vertical' | 'inline';
export interface FormRule {
    required?: boolean;
    /** 正则（作用于字符串值） */
    pattern?: RegExp;
    /** 字符串长度或数组个数的上下限 */
    min?: number;
    max?: number;
    message?: string;
    /** 自定义校验：返回 true/undefined 通过，false/字符串 失败（字符串即错误文案）；可 async */
    validator?: (v: any) => boolean | string | undefined | Promise<boolean | string | undefined>;
}
export interface FormProps {
    children: React.ReactNode;
    layout?: FormLayout;
    /** horizontal 下标签列宽（px）。默认 96 */
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
    /** 必填标记（仅显示星号；校验交给 rules） */
    required?: boolean;
    /** 说明文字（无错误时显示） */
    help?: React.ReactNode;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function FormItem(props: FormItemProps): React.ReactElement;
/** 提交按钮：走所属 Form 的 submit（全量校验） */
declare function FormSubmit(props: {
    text?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}): React.ReactElement;
export declare const Form: typeof FormComp & {
    Item: typeof FormItem;
    Submit: typeof FormSubmit;
};
export default Form;
