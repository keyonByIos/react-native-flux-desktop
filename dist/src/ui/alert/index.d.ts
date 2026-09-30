import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type AlertType = 'success' | 'info' | 'warning' | 'error';
export interface AlertProps {
    type?: AlertType;
    message?: React.ReactNode;
    description?: React.ReactNode;
    showIcon?: boolean;

    icon?: React.ReactNode;
    closable?: boolean;

    closeText?: React.ReactNode;

    banner?: boolean;

    action?: React.ReactNode;

    marquee?: boolean;

    marqueeSpeed?: number;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Alert(props: AlertProps): React.ReactElement | null;
export default Alert;
