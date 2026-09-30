import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type ButtonType } from '../button';
export interface ModalProps {
    open?: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;

    footer?: React.ReactNode | false;
    okText?: React.ReactNode;
    cancelText?: React.ReactNode;

    okType?: ButtonType;

    okDanger?: boolean;

    confirmLoading?: boolean;
    onOk?: () => void;
    onCancel?: () => void;

    maskClosable?: boolean;

    mask?: boolean;

    closable?: boolean;
    width?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Modal(props: ModalProps): React.ReactElement | null;

export type ModalFunctionType = 'confirm' | 'info' | 'success' | 'error' | 'warning';

export interface ModalConfig {

    key?: React.Key;
    title?: React.ReactNode;
    content?: React.ReactNode;

    type?: ModalFunctionType;

    icon?: React.ReactNode;
    okText?: React.ReactNode;
    cancelText?: React.ReactNode;
    okType?: ButtonType;

    okDanger?: boolean;
    onOk?: () => void;
    onCancel?: () => void;

    afterClose?: () => void;

    closable?: boolean;

    maskClosable?: boolean;
    width?: number;

    footer?: React.ReactNode | false;
    style?: StyleProp<ViewStyle>;
}

export interface ModalApi {
    open: (config: ModalConfig) => React.Key;
    confirm: (config: ModalConfig) => React.Key;
    info: (config: ModalConfig) => React.Key;
    success: (config: ModalConfig) => React.Key;
    error: (config: ModalConfig) => React.Key;
    warning: (config: ModalConfig) => React.Key;

    destroy: (key?: React.Key) => void;
}

export declare function useModal(): [ModalApi, React.ReactElement];

export declare const modal: {
    useModal: typeof useModal;
};
export default Modal;
