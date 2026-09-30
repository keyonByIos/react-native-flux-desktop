import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PopconfirmProps {

    title?: React.ReactNode;

    description?: React.ReactNode;

    children: React.ReactNode;

    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';

    okText?: React.ReactNode;

    cancelText?: React.ReactNode;

    hideCancel?: boolean;

    danger?: boolean;

    okButtonLoading?: boolean;

    icon?: React.ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
    onOpenChange?: (open: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Popconfirm(props: PopconfirmProps): React.ReactElement;
export default Popconfirm;
