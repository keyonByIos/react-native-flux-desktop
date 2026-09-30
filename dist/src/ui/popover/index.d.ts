import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PopoverProps {
    title?: React.ReactNode;
    content?: React.ReactNode;
    /** 触发器（children） */
    children: React.ReactNode;
    /** 受控展开 */
    open?: boolean;
    placement?: 'bottom' | 'top' | 'left' | 'right';
    trigger?: 'click' | 'hover' | 'none';
    /** 面板背景色 */
    color?: string;
    /** 是否显示箭头，默认 true */
    arrow?: boolean;
    style?: StyleProp<ViewStyle>;
    onOpenChange?: (open: boolean) => void;
}
export declare function Popover(props: PopoverProps): React.ReactElement;
export default Popover;
