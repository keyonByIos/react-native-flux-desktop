import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type ProFormFieldType = 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'switch' | 'custom';
export interface ProFormRule {
    required?: boolean;
    /** 必填缺失时的文案（默认「请填写{label}」） */
    requiredMessage?: string;
    /** 正则（仅对 string 值生效） */
    pattern?: RegExp;
    min?: number;
    max?: number;
    /** min/max 语义：string 比长度、number 比值 */
    message?: string;
    /** 自定义校验：返回字符串即错误 */
    validator?: (value: any, values: ProFormValues) => string | null | undefined;
}
export interface ProFormField {
    /** 值索引键 */
    name: string;
    label?: string;
    type?: ProFormFieldType;
    /** 控件属性透传（placeholder/options/rows/min/max/suffix…） */
    fieldProps?: Record<string, any>;
    rules?: ProFormRule[];
    /** 字段下方的说明文字 */
    tooltip?: string;
    /** 占几列（默认 1） */
    span?: number;
    disabled?: boolean;
    /** type='custom' 时的渲染：自行受控 */
    render?: (value: any, values: ProFormValues) => React.ReactNode;
    /** 初始值（无 defaultValue 对象时用） */
    initialValue?: any;
}
export type ProFormValues = Record<string, any>;
/** 命令式接口：由父级持有 ref 传入，用于「重置」「清校验」等跨组件调用。 */
export interface ProFormActions {
    reset: () => void;
    clearValidate: () => void;
    setValues: (patch: ProFormValues) => void;
    validate: () => boolean;
}
export interface ProFormProps {
    fields: ProFormField[];
    title?: string;
    /** 每行列数（默认 2） */
    columns?: number;
    /** 列间隙 */
    gap?: number;
    values?: ProFormValues;
    defaultValue?: ProFormValues;
    onValuesChange?: (patch: ProFormValues, all: ProFormValues) => void;
    /** 校验通过后的提交回调，返回 Promise 时按钮进 loading */
    onFinish?: (values: ProFormValues) => void | Promise<void>;
    onFinishFailed?: (errors: Record<string, string>) => void;
    /** 底部动作区：默认「重置 + 提交」，传 false 整体关闭，传节点自定义 */
    submitter?: false | {
        resetText?: string;
        submitText?: string;
    };
    /** 父级 ref 传入的命令式句柄 */
    actions?: React.MutableRefObject<ProFormActions | null>;
    style?: StyleProp<ViewStyle>;
}
export declare function ProForm(props: ProFormProps): React.ReactElement;
export default ProForm;
