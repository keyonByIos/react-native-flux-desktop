import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SliderProps {
    min?: number;
    max?: number;
    step?: number;

    value?: number;

    defaultValue?: number;
    disabled?: boolean;

    marks?: Record<number, React.ReactNode>;

    tooltipVisible?: boolean;

    formatter?: (v: number) => React.ReactNode;
    onChange?: (v: number) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Slider(props: SliderProps): React.ReactElement;
export default Slider;
