import React from 'react';
import { StyleProp, ViewStyle, TransformArray } from '../types';
import { type Easing } from './easing';
export interface FlipOptions {
    duration?: number;

    easing?: Easing;
}

export declare function useFlip(options?: FlipOptions): {
    onLayoutAbs: (e: any) => void;
    transform: TransformArray;
};
export interface FlipProps extends FlipOptions {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export declare function Flip(props: FlipProps): React.ReactElement;
