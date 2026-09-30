import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type TagPreset = 'default' | 'success' | 'processing' | 'error' | 'warning';
export interface TagProps {
    color?: TagPreset | string;
    bordered?: boolean;
    closable?: boolean;

    icon?: string | React.ReactNode;
    onClose?: () => void;

    onClick?: () => void;
    onPress?: () => void;

    textColor?: string;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function TagBase(props: TagProps): React.ReactElement;
export interface CheckableTagProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function CheckableTag(props: CheckableTagProps): React.ReactElement;

export declare const Tag: typeof TagBase & {
    CheckableTag: typeof CheckableTag;
};
export default Tag;
