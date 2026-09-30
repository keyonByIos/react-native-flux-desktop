import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type ProgressType = 'line' | 'circle' | 'dashboard';
export interface ProgressProps {
    type?: ProgressType;
    percent?: number;
    status?: 'normal' | 'success' | 'exception' | 'active';
    showInfo?: boolean;

    size?: 'small' | 'default' | 'large';

    width?: number;

    strokeWidth?: number;
    strokeColor?: string;
    trailColor?: string;

    format?: (percent: number) => string;

    steps?: number;

    success?: {
        percent?: number;
        strokeColor?: string;
    };

    gapDegree?: number;

    gapPosition?: 'top' | 'bottom' | 'left' | 'right';
    style?: StyleProp<ViewStyle>;
}
export declare function Progress(props: ProgressProps): React.ReactElement;
