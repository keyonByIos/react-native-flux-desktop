import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RadialBarProps {

    data: Record<string, any>[];
    nameField?: string;
    valueField?: string;

    max?: number;

    maxField?: string;

    size?: number;

    color?: string | string[];

    centerTitle?: string;

    legend?: boolean;
    animation?: boolean;
    animateDuration?: number;
    formatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function RadialBarChart(props: RadialBarProps): React.ReactElement;
export default RadialBarChart;
