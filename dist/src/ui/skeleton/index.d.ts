import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SkeletonProps {
    loading?: boolean;
    active?: boolean;
    avatar?: boolean;
    title?: boolean;

    paragraph?: number | {
        rows: number;
    };
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function SkeletonBase(props: SkeletonProps): React.ReactElement;
export interface SkeletonAvatarProps {
    active?: boolean;
    shape?: 'circle' | 'square';
    size?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function SkeletonAvatar(props: SkeletonAvatarProps): React.ReactElement;
export interface SkeletonElementProps {
    active?: boolean;
    size?: 'default' | 'large' | 'small';
    style?: StyleProp<ViewStyle>;
}
export declare function SkeletonButton(props: SkeletonElementProps): React.ReactElement;
export declare function SkeletonInput(props: SkeletonElementProps): React.ReactElement;
export interface SkeletonImageProps {
    active?: boolean;
    style?: StyleProp<ViewStyle>;
}

export declare function SkeletonImage(props: SkeletonImageProps): React.ReactElement;

export declare const Skeleton: typeof SkeletonBase & {
    Avatar: typeof SkeletonAvatar;
    Button: typeof SkeletonButton;
    Input: typeof SkeletonInput;
    Image: typeof SkeletonImage;
};
export default Skeleton;
