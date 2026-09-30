import React from 'react';
import { StyleProp, ViewStyle } from '../types';
interface Base {
    children: React.ReactNode;
    duration?: number;
    fade?: boolean;
    style?: StyleProp<ViewStyle>;
}

export declare function MoveIn(props: Base & {
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
}): React.ReactElement;

export declare function ScaleIn(props: Base & {
    from?: number;
}): React.ReactElement;

export declare function RotateIn(props: Base & {
    from?: number;
}): React.ReactElement;
export {};
