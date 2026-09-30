import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type ButtonType } from '../button';
export interface ModalProps {
    open?: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;
    /** 底部按钮区：true 默认按钮 / false 隐藏 / ReactNode 自定义 */
    footer?: React.ReactNode | false;
    okText?: React.ReactNode;
    cancelText?: React.ReactNode;
    /** 确定按钮类型，默认 primary */
    okType?: ButtonType;
    /** 确定按钮危险样式 */
    okDanger?: boolean;
    /** 确定按钮加载中 */
    confirmLoading?: boolean;
    onOk?: () => void;
    onCancel?: () => void;
    /** 点击遮罩是否关闭 */
    maskClosable?: boolean;
    /** 是否显示遮罩，默认 true */
    mask?: boolean;
    /** 是否显示关闭图标，默认 true */
    closable?: boolean;
    width?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Modal(props: ModalProps): React.ReactElement | null;
/** 命令式弹窗类型：confirm 双按钮，其余单「确定」 */
export type ModalFunctionType = 'confirm' | 'info' | 'success' | 'error' | 'warning';
/** 单条命令式弹窗配置（对齐 antd ModalFuncProps 核心子集） */
export interface ModalConfig {
    /** 唯一标识：同 key 再次触发就地替换 */
    key?: React.Key;
    title?: React.ReactNode;
    content?: React.ReactNode;
    /** 弹窗类型（决定默认图标与是否显示取消按钮），缺省 confirm */
    type?: ModalFunctionType;
    /** 自定义图标节点（覆盖类型默认图标） */
    icon?: React.ReactNode;
    okText?: React.ReactNode;
    cancelText?: React.ReactNode;
    okType?: ButtonType;
    /** 确定按钮危险样式 */
    okDanger?: boolean;
    onOk?: () => void;
    onCancel?: () => void;
    /** 关闭后回调 */
    afterClose?: () => void;
    /** 是否显示右上角关闭图标（confirm 默认 false，靠遮罩/取消关闭） */
    closable?: boolean;
    /** 点击遮罩是否关闭（默认 true） */
    maskClosable?: boolean;
    width?: number;
    /** 自定义底部（false 隐藏）；缺省按类型自动给按钮 */
    footer?: React.ReactNode | false;
    style?: StyleProp<ViewStyle>;
}
/** useModal 返回的命令式句柄 */
export interface ModalApi {
    open: (config: ModalConfig) => React.Key;
    confirm: (config: ModalConfig) => React.Key;
    info: (config: ModalConfig) => React.Key;
    success: (config: ModalConfig) => React.Key;
    error: (config: ModalConfig) => React.Key;
    warning: (config: ModalConfig) => React.Key;
    /** 销毁：传 key 关单条，不传清空全部 */
    destroy: (key?: React.Key) => void;
}
/**
 * antd v5 风格 hook：返回 [modalApi, contextHolder]。
 * 把 contextHolder 渲染进组件（锚点加载），用 modalApi.confirm/info/success/error/warning(config) 命令式弹窗。
 */
export declare function useModal(): [ModalApi, React.ReactElement];
/** 全局 modal 对象：目前提供 hook 用法（useModal）。无 portal，故不提供静态全局方法。 */
export declare const modal: {
    useModal: typeof useModal;
};
export default Modal;
