import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
export interface BulletProps {

    data: Record<string, any>[];
    labelField?: string;
    valueField?: string;
    targetField?: string;

    ranges?: number[];

    rangeColors?: string[];

    color?: string;

    targetColor?: string;

    max?: number;
    height?: number;
    width?: number;

    barRatio?: number;

    label?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    grid?: GridConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function BulletChart(props: BulletProps): React.ReactElement;
export default BulletChart;
