import React from 'react';
import { ImageSource, StyleProp, ViewStyle } from '../../types';
export interface AvatarProps {
    size?: 'large' | 'default' | 'small' | number;
    shape?: 'circle' | 'square';
    src?: ImageSource | string;
    alt?: string;

    icon?: string | React.ReactNode;

    backgroundColor?: string;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function AvatarBase(props: AvatarProps): React.ReactElement;
export interface AvatarGroupProps {

    max?: number;

    maxStyle?: StyleProp<ViewStyle>;

    maxText?: React.ReactNode;

    space?: number;
    size?: AvatarProps['size'];
    shape?: AvatarProps['shape'];
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}
declare function AvatarGroup(props: AvatarGroupProps): React.ReactElement;
export declare const Avatar: typeof AvatarBase & {
    Group: typeof AvatarGroup;
};
export {};
