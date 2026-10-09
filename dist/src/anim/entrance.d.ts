import React from 'react';
import { StyleProp, ViewStyle } from '../types';
interface Base {
    children: React.ReactNode;
    duration?: number;
    fade?: boolean;
    style?: StyleProp<ViewStyle>;
}
/** 平移入场。direction = 元素「进入时的来向」：up=从下方上移落位，left=从右方左移落位。 */
export declare function MoveIn(props: Base & {
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
}): React.ReactElement;
/** 缩放入场：from → 1。 */
export declare function ScaleIn(props: Base & {
    from?: number;
}): React.ReactElement;
/** 旋转入场：from(度) → 0。 */
export declare function RotateIn(props: Base & {
    from?: number;
}): React.ReactElement;
export {};
