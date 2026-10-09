import React from 'react';
import { ImageSource, StyleProp, ViewStyle } from '../../types';
export interface AvatarProps {
    size?: 'large' | 'default' | 'small' | number;
    shape?: 'circle' | 'square';
    src?: ImageSource | string;
    alt?: string;
    /** 图标占位（无 src 时优先渲染） */
    icon?: string | React.ReactNode;
    /** 自定义底色 */
    backgroundColor?: string;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function AvatarBase(props: AvatarProps): React.ReactElement;
export interface AvatarGroupProps {
    /** 最多显示个数，超出折叠为 +N */
    max?: number;
    /** +N 溢出头像的自定义样式 */
    maxStyle?: StyleProp<ViewStyle>;
    /** 溢出头像文本，默认 +N */
    maxText?: React.ReactNode;
    /** 相邻重叠间距（负 margin），默认 8 */
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
