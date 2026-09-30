import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AutoCompleteOption {
    value: string;
    /** 展示内容，缺省用 value */
    label?: React.ReactNode;
}
export interface AutoCompleteProps {
    options: (string | AutoCompleteOption)[];
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    /** 自动聚焦（并展开建议面板） */
    autoFocus?: boolean;
    size?: 'large' | 'middle' | 'small';
    /** 是否按输入过滤（默认 true）；传 false 则始终展示全部；或传自定义匹配函数 */
    filterOption?: boolean | ((input: string, option: string) => boolean);
    /** 面板最大高度（px），超出滚动。默认 256 */
    maxHeight?: number;
    style?: StyleProp<ViewStyle>;
    onChange?: (v: string) => void;
    onSelect?: (v: string) => void;
    onSearch?: (v: string) => void;
}
export declare function AutoComplete(props: AutoCompleteProps): React.ReactElement;
export default AutoComplete;
