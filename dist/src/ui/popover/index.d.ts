import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PopoverProps {
    title?: React.ReactNode;
    content?: React.ReactNode;

    children: React.ReactNode;

    open?: boolean;
    placement?: 'bottom' | 'top' | 'left' | 'right';
    trigger?: 'click' | 'hover' | 'none';

    color?: string;

    arrow?: boolean;
    style?: StyleProp<ViewStyle>;
    onOpenChange?: (open: boolean) => void;
}
export declare function Popover(props: PopoverProps): React.ReactElement;
export default Popover;
