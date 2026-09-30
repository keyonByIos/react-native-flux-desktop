import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface MentionsOption {

    value: string;

    label?: React.ReactNode;

    disabled?: boolean;
}
export interface MentionsProps {
    value?: string;
    defaultValue?: string;
    options: Array<MentionsOption | string>;

    prefix?: string;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    rows?: number;

    maxHeight?: number;
    style?: StyleProp<ViewStyle>;
    onChange?: (v: string) => void;

    onSelect?: (opt: MentionsOption) => void;
}
export declare function Mentions(props: MentionsProps): React.ReactElement;
export default Mentions;
