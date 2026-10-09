import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RateProps {
    value?: number;
    defaultValue?: number;
    count?: number;
    onChange?: (v: number) => void;
    /** 只读展示 */
    readOnly?: boolean;
    disabled?: boolean;
    allowClear?: boolean;
    /** 允许半星 */
    allowHalf?: boolean;
    /** 自定义字符（字符串按文本渲染并着色，或传入图标节点） */
    character?: React.ReactNode;
    size?: number;
    /** 字符之间的间隙 */
    gap?: number;
    /** 填充色（默认 colorWarning） */
    color?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function Rate(props: RateProps): React.ReactElement;
export default Rate;
