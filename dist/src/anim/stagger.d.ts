import React from 'react';
import { StyleProp, ViewStyle } from '../types';
import { type AnimPreset, type PresetName } from './presets';
export interface StaggerProps {
    children: React.ReactNode;

    gap?: number;

    preset?: PresetName;

    animation?: AnimPreset;

    delay?: number;
    style?: StyleProp<ViewStyle>;
}

export declare function Stagger(props: StaggerProps): React.ReactElement;
export interface StaggerItemProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export declare function StaggerItem(props: StaggerItemProps): React.ReactElement;
