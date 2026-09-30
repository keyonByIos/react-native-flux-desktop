import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface BadgeProps {
    count?: number | string;
    dot?: boolean;

    color?: 'error' | 'default' | 'processing' | 'success' | 'warning' | string;

    showZero?: boolean;

    overflowCount?: number;

    offset?: [number, number];
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function BadgeBase(props: BadgeProps): React.ReactElement;
export interface RibbonProps {
    text?: React.ReactNode;

    icon?: React.ReactNode;
    color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | string;

    placement?: 'start' | 'end';
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Ribbon(props: RibbonProps): React.ReactElement;
export type BadgeStatusType = 'default' | 'error' | 'processing' | 'success' | 'warning';
export interface BadgeStatusProps {
    status?: BadgeStatusType;
    text?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Status(props: BadgeStatusProps): React.ReactElement;

export declare const Badge: typeof BadgeBase & {
    Ribbon: typeof Ribbon;
    Status: typeof Status;
};
