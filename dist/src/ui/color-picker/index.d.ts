import React from 'react';
import { StyleProp, ViewStyle } from '../../types';

export declare const PRESET_COLORS: string[];
type ColorSize = 'small' | 'middle' | 'large';
type ColorPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export interface ColorPickerProps {
    value?: string;
    defaultValue?: string;
    disabled?: boolean;

    size?: ColorSize;

    showText?: boolean | ((color?: string) => React.ReactNode);

    presets?: string[];

    allowClear?: boolean;

    placement?: ColorPlacement;

    open?: boolean;
    onChange?: (color: string) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function ColorPicker(props: ColorPickerProps): React.ReactElement;
export {};
