import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RateProps {
    value?: number;
    defaultValue?: number;
    count?: number;
    onChange?: (v: number) => void;

    readOnly?: boolean;
    disabled?: boolean;
    allowClear?: boolean;

    allowHalf?: boolean;

    character?: React.ReactNode;
    size?: number;

    gap?: number;

    color?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function Rate(props: RateProps): React.ReactElement;
export default Rate;
