import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TagInputProps {
    /** 受控标签列表 */
    value?: string[];
    defaultValue?: string[];
    onChange?: (tags: string[]) => void;
    /** 最大标签数 */
    max?: number;
    /** 是否允许重复 */
    allowDuplicate?: boolean;
    /** 分隔符（输入时遇到即拆分添加），默认 [',', '，'] */
    separators?: string[];
    placeholder?: string;
    disabled?: boolean;
    /** 标签尺寸（视觉预留，当前 Tag 组件无 size prop） */
    tagSize?: 'small' | 'default' | 'large';
    style?: StyleProp<ViewStyle>;
}
export declare function TagInput(props: TagInputProps): React.ReactElement;
export default TagInput;
