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
    /** 2D 变换（绘制期生效，不参与布局）：translate/scale/rotate/skew 有序连乘成一个仿射矩阵 */
    transform?: TransformArray;
    /** 变换原点，默认 '50% 50%'（盒中心）；支持 'left/top/right/bottom/center'、px、% */
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
/** 单个 2D 变换算子（RN/CSS 风格）。rotate/skew 接受 '45deg' / '0.7rad' / 45（度）。 */
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
    /** 布局完成且尺寸变化时回调（host 每帧布局后比对派发，非每帧） */
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
    /** 同 onLayout，但 x/y 为窗口绝对坐标（浮层协调器做点击命中判定用） */
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
    /** 连续悬停移动（host 每帧对最近带此属性的祖先派发，带节点局部坐标）：图表 hover 反算命中用 */
    onMouseMove?: (e: MoveEvent) => void;
    /** 连续 move 目标离开（移到无 handler 区或离窗时补发）：与 onMouseEnter/Leave 解耦，专供 onMouseMove 覆盖层收尾 */
    onMouseMoveLeave?: () => void;
}
/** 鼠标移动事件：局部坐标（相对命中节点布局原点，逻辑像素） */
export interface MoveEvent {
    nativeEvent: {
        locationX: number;
        locationY: number;
    };
}
/** 按下/抬起事件（RN 语义子集） */
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
    /** 桌面端特有：鼠标进出（自绘管线自己做命中测试派发） */
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    disabled?: boolean;
}
