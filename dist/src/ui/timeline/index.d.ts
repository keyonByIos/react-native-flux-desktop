import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type TimelineColor = 'blue' | 'green' | 'red' | 'gray' | string;
export type TimelineMode = 'left' | 'right' | 'alternate';
export interface TimelineItem {
    key?: string | number;
    color?: TimelineColor;
    children?: React.ReactNode;

    dot?: React.ReactNode;

    label?: React.ReactNode;

    position?: 'left' | 'right';
    content?: React.ReactNode;
}
export interface TimelineProps {
    items?: TimelineItem[];

    mode?: TimelineMode;

    pending?: React.ReactNode;

    reverse?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Timeline(props: TimelineProps): React.ReactElement;
export default Timeline;
