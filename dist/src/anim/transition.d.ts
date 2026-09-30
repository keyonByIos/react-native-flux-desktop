import React from 'react';
import { StyleProp, ViewStyle } from '../types';
import { type AnimPreset, type PresetName } from './presets';
export interface TransitionOptions {

    enter?: AnimPreset | PresetName;

    exit?: AnimPreset | PresetName;
}

export declare function useTransition(visible: boolean, options?: TransitionOptions): {
    mounted: boolean;
    style: ViewStyle;
};
export interface TransitionProps extends TransitionOptions {
    visible: boolean;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export declare function Transition(props: TransitionProps): React.ReactElement | null;
