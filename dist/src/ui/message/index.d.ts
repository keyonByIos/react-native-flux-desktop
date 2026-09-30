import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface MessageConfig {
    content: React.ReactNode;

    type?: MessageType;

    icon?: React.ReactNode;

    duration?: number;

    key?: React.Key;

    onClose?: () => void;

    style?: StyleProp<ViewStyle>;
}

export interface MessageOptions {

    duration?: number;

    top?: number;

    maxCount?: number;
}

export interface MessageApi {

    open: (config: MessageConfig) => React.Key;
    success: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    error: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    info: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    warning: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    loading: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;

    destroy: () => void;
}

export interface MessageProps {
    open?: boolean;
    type?: MessageType;
    content?: React.ReactNode;
    icon?: React.ReactNode;
    duration?: number;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
}

export declare function useMessage(options?: MessageOptions): [MessageApi, React.ReactElement];

export declare const message: {
    useMessage: typeof useMessage;
};

export declare function Message(props: MessageProps): React.ReactElement | null;
export default message;
