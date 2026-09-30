import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click';
export interface TooltipProps {
    title?: React.ReactNode;
    children: React.ReactNode;
    placement?: TooltipPlacement;

    trigger?: TooltipTrigger;

    arrow?: boolean;

    color?: string;

    open?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function Tooltip(props: TooltipProps): React.ReactElement;
export default Tooltip;
