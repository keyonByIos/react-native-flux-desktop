import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface MentionsOption {
    /** 插入的值（不含前缀） */
    value: string;
    /** 面板展示内容，默认取 value */
    label?: React.ReactNode;
    /** 禁用该项 */
    disabled?: boolean;
}
export interface MentionsProps {
    value?: string;
    defaultValue?: string;
    options: Array<MentionsOption | string>;
    /** 触发前缀，默认 '@' */
    prefix?: string;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    rows?: number;
    /** 面板最大高度（px），超出内部滚动。默认 200 */
    maxHeight?: number;
    style?: StyleProp<ViewStyle>;
    onChange?: (v: string) => void;
    /** 选中某项（插入前触发） */
    onSelect?: (opt: MentionsOption) => void;
}
export declare function Mentions(props: MentionsProps): React.ReactElement;
export default Mentions;
