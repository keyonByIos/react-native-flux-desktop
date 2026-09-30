import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AutoCompleteOption {
    value: string;

    label?: React.ReactNode;
}
export interface AutoCompleteProps {
    options: (string | AutoCompleteOption)[];
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;

    autoFocus?: boolean;
    size?: 'large' | 'middle' | 'small';

    filterOption?: boolean | ((input: string, option: string) => boolean);

    maxHeight?: number;
    style?: StyleProp<ViewStyle>;
    onChange?: (v: string) => void;
    onSelect?: (v: string) => void;
    onSearch?: (v: string) => void;
}
export declare function AutoComplete(props: AutoCompleteProps): React.ReactElement;
export default AutoComplete;
