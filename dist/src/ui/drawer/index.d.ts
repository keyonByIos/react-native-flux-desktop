import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DrawerProps {
    open?: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;
    placement?: 'left' | 'right' | 'top' | 'bottom';
    onClose?: () => void;
    maskClosable?: boolean;

    mask?: boolean;

    closable?: boolean;

    extra?: React.ReactNode;

    footer?: React.ReactNode;

    size?: number;

    width?: number;

    height?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Drawer(props: DrawerProps): React.ReactElement | null;
export default Drawer;
