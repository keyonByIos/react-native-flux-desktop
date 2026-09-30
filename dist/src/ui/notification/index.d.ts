import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationPlacement = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';

export interface NotificationConfig {

    key?: React.Key;

    title?: React.ReactNode;

    description?: React.ReactNode;

    type?: NotificationType;

    icon?: React.ReactNode;

    placement?: NotificationPlacement;

    duration?: number;

    onClose?: () => void;

    onClick?: () => void;

    btn?: React.ReactNode;

    closeIcon?: React.ReactNode;

    style?: StyleProp<ViewStyle>;
}

export interface NotificationOptions {

    placement?: NotificationPlacement;

    duration?: number;

    top?: number;

    bottom?: number;

    maxCount?: number;
}

export interface NotificationApi {
    open: (config: NotificationConfig) => React.Key;
    success: (config: NotificationConfig) => React.Key;
    error: (config: NotificationConfig) => React.Key;
    info: (config: NotificationConfig) => React.Key;
    warning: (config: NotificationConfig) => React.Key;

    destroy: (key?: React.Key) => void;
}

export interface NotificationProps {
    open?: boolean;
    title?: React.ReactNode;
    description?: React.ReactNode;
    type?: NotificationType;
    placement?: NotificationPlacement;
    duration?: number;
    onClose?: () => void;

    icon?: string;
    btn?: React.ReactNode;
    closeIcon?: React.ReactNode;
    onClick?: () => void;
    style?: StyleProp<ViewStyle>;
}

export declare function useNotification(options?: NotificationOptions): [NotificationApi, React.ReactElement];

export declare const notification: {
    useNotification: typeof useNotification;
};

export declare function Notification(props: NotificationProps): React.ReactElement | null;
export default notification;
