import React from 'react';
import { StyleProp, ViewStyle } from '../types';
export declare function useEnter(duration?: number): number;
export interface FadeInProps {
    children: React.ReactNode;
    duration?: number;
    style?: StyleProp<ViewStyle>;

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
}
export declare function FadeIn(props: FadeInProps): React.ReactElement;
export default FadeIn;
