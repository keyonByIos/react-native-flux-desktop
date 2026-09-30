import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepsLineConfig {

    style?: 'solid' | 'dashed' | 'dotted';

    width?: number;

    color?: string;

    activeColor?: string;

    gap?: number;
}
export interface StepItem {
    key?: string | number;
    title?: React.ReactNode;
    description?: React.ReactNode;
    subTitle?: React.ReactNode;
    status?: StepStatus;

    icon?: React.ReactNode;

    disabled?: boolean;
}
export interface StepsProps {
    current?: number;

    initial?: number;
    items?: StepItem[];
    status?: 'process' | 'error' | 'finish';
    size?: 'default' | 'small';
    direction?: 'horizontal' | 'vertical';

    labelPlacement?: 'horizontal' | 'vertical';

    progressDot?: boolean;

    readOnly?: boolean;

    showNumber?: boolean;
    onChange?: (current: number) => void;

    line?: StepsLineConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function Steps(props: StepsProps): React.ReactElement;
