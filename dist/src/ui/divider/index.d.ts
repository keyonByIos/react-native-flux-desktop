import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DividerProps {
    type?: 'horizontal' | 'vertical';

    variant?: 'solid' | 'dashed' | 'dotted';

    dashed?: boolean;

    plain?: boolean;

    children?: React.ReactNode;

    orientation?: 'left' | 'center' | 'right';
    style?: StyleProp<ViewStyle>;
}
export declare function Divider(props: DividerProps): React.ReactElement;
