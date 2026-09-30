import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TagInputProps {

    value?: string[];
    defaultValue?: string[];
    onChange?: (tags: string[]) => void;

    max?: number;

    allowDuplicate?: boolean;

    separators?: string[];
    placeholder?: string;
    disabled?: boolean;

    tagSize?: 'small' | 'default' | 'large';
    style?: StyleProp<ViewStyle>;
}
export declare function TagInput(props: TagInputProps): React.ReactElement;
export default TagInput;
