import React from 'react';
import { BaseProps, ImageSource, PressableProps, StyleProp, TextStyle, ViewStyle } from '../types';
export interface ViewProps extends BaseProps {
    onTouchStart?: (e: any) => void;

    pointerEvents?: 'auto' | 'none';

    __drag?: {
        id: number;
    };

    __drop?: {
        id: number;
    };
}
export declare const View: React.ForwardRefExoticComponent<ViewProps & React.RefAttributes<any>>;
export interface TextProps extends BaseProps {
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
    onPress?: () => void;

    rotate?: number;

    preserveTrailingSpace?: boolean;

    selectable?: boolean;
}
export declare function Text(props: TextProps): React.ReactElement;
export interface ImageProps extends BaseProps {
    source?: ImageSource | string;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}
export declare function Image(props: ImageProps): React.ReactElement;
export interface VideoProps extends BaseProps {

    videoId?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}
export declare function Video(props: VideoProps): React.ReactElement;

export interface PressableState {
    pressed: boolean;
}
export interface PressablePropsEx extends Omit<PressableProps, 'style' | 'children'> {
    style?: StyleProp<ViewStyle> | ((state: PressableState) => StyleProp<ViewStyle>);
    children?: React.ReactNode | ((state: PressableState) => React.ReactNode);
}
export declare function Pressable(props: PressablePropsEx): React.ReactElement;
export interface ScrollViewProps extends BaseProps {
    horizontal?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
    showsVerticalScrollIndicator?: boolean;

    onScroll?: (e: {
        nativeEvent: {
            contentOffset: {
                x: number;
                y: number;
            };
            contentSize: {
                width: number;
                height: number;
            };
        };
    }) => void;

    scrollY?: number;

    scrollX?: number;
}
export declare function ScrollView(props: ScrollViewProps): React.ReactElement;
export interface WindowProps extends BaseProps {
    title?: string;
    width?: number;
    height?: number;

    x?: number;
    y?: number;

    parentId?: number;

    modal?: boolean;

    alwaysOnTop?: boolean;

    tag?: string;

    resizable?: boolean;

    minWidth?: number;
    minHeight?: number;

    maxWidth?: number;
    maxHeight?: number;

    decorations?: boolean;

    transparent?: boolean;

    maximized?: boolean;

    center?: boolean;

    onPreparing?: () => void;

    onLoading?: () => void;

    onReady?: () => void;

    onClose?: () => void;

    onFocused?: (focused: boolean) => void;
}
export declare function Window(props: WindowProps): React.ReactElement;
