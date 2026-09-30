import { ReactNode } from 'react';
export type DimensionValue = number | 'auto' | `${number}%` | string | undefined;
export type FlexAlignType = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | 'space-between' | 'space-around' | 'space-evenly';
export type FlexStyle = {
    display?: 'flex' | 'none';
    width?: DimensionValue;
    height?: DimensionValue;
    minWidth?: DimensionValue;
    minHeight?: DimensionValue;
    maxWidth?: DimensionValue;
    maxHeight?: DimensionValue;
    flex?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    alignItems?: FlexAlignType;
    alignContent?: FlexAlignType;
    alignSelf?: 'auto' | FlexAlignType;
    justifyContent?: FlexAlignType;
    position?: 'relative' | 'absolute';
    top?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    bottom?: DimensionValue;
    margin?: DimensionValue;
    marginTop?: DimensionValue;
    marginRight?: DimensionValue;
    marginBottom?: DimensionValue;
    marginLeft?: DimensionValue;
    marginHorizontal?: DimensionValue;
    marginVertical?: DimensionValue;
    padding?: DimensionValue;
    paddingTop?: DimensionValue;
    paddingRight?: DimensionValue;
    paddingBottom?: DimensionValue;
    paddingLeft?: DimensionValue;
    paddingHorizontal?: DimensionValue;
    paddingVertical?: DimensionValue;
    gap?: number;
    aspectRatio?: number | string;
    overflow?: 'visible' | 'hidden' | 'scroll';
    zIndex?: number;
};
export type ViewStyle = FlexStyle & {
    backgroundColor?: string;
    opacity?: number;
    borderRadius?: number | Partial<Record<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', number>>;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    borderWidth?: number;
    borderTopWidth?: number;
    borderRightWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
    boxShadow?: string;

    transform?: TransformArray;

    transformOrigin?: string;
    shadowColor?: string;
    shadowOpacity?: number;
    shadowRadius?: number;
    shadowOffset?: {
        width: number;
        height: number;
    };
    cursor?: string;
    [key: string]: unknown;
};
export type TextStyle = ViewStyle & {
    color?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontFamily?: string;
    fontStyle?: 'normal' | 'italic';
    lineHeight?: number | string;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through';
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    letterSpacing?: number;
};
export type ImageStyle = ViewStyle & {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
};
export type StyleProp<T> = T | Readonly<T> | Array<StyleProp<T>> | false | null | undefined;

export type TransformItem = {
    translateX: number | string;
} | {
    translateY: number | string;
} | {
    scale: number;
} | {
    scaleX: number;
} | {
    scaleY: number;
} | {
    rotate: number | string;
} | {
    skewX: number | string;
} | {
    skewY: number | string;
};
export type TransformArray = TransformItem[];
export interface ImageSource {
    uri?: string;
    width?: number;
    height?: number;
}
export interface BaseProps {
    id?: string;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    children?: ReactNode;

    onLayout?: (e: {
        nativeEvent: {
            layout: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
    }) => void;

    onLayoutAbs?: (e: {
        nativeEvent: {
            layout: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
    }) => void;

    onMouseMove?: (e: MoveEvent) => void;

    onMouseMoveLeave?: () => void;
}

export interface MoveEvent {
    nativeEvent: {
        locationX: number;
        locationY: number;
    };
}

export interface PressEvent {
    nativeEvent: {
        x: number;
        y: number;
    };
}
export interface PressableProps extends BaseProps {
    onPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;

    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    disabled?: boolean;
}
