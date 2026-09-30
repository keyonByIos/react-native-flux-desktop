import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click';
export interface TooltipProps {
    title?: React.ReactNode;
    children: React.ReactNode;
    placement?: TooltipPlacement;
    /** 触发方式，默认 hover */
    trigger?: TooltipTrigger;
    /** 是否显示箭头，默认 true */
    arrow?: boolean;
    /** 自定义气泡底色 */
    color?: string;
    /** 受控显隐（demo 用），不传则由 trigger 驱动 */
    open?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function Tooltip(props: TooltipProps): React.ReactElement;
export default Tooltip;
