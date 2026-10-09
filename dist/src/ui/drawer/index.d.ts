import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DrawerProps {
    open?: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;
    placement?: 'left' | 'right' | 'top' | 'bottom';
    onClose?: () => void;
    maskClosable?: boolean;
    /** 是否显示遮罩，默认 true */
    mask?: boolean;
    /** 是否显示关闭图标，默认 true */
    closable?: boolean;
    /** 头部右侧额外内容（关闭图标左侧） */
    extra?: React.ReactNode;
    /** 底部操作区 */
    footer?: React.ReactNode;
    /** left/right 宽，top/bottom 高 */
    size?: number;
    /** left/right 宽度（优先于 size） */
    width?: number;
    /** top/bottom 高度（优先于 size） */
    height?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Drawer(props: DrawerProps): React.ReactElement | null;
export default Drawer;
