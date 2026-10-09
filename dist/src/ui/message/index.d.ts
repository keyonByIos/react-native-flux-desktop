import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';
/** 单条消息的配置（hook 的 api.open / 类型方法皆可传入） */
export interface MessageConfig {
    content: React.ReactNode;
    /** 提示类型（决定默认图标与配色） */
    type?: MessageType;
    /** 自定义图标（覆盖类型默认图标） */
    icon?: React.ReactNode;
    /** 自动关闭延时（ms）；0 表示常驻 */
    duration?: number;
    /** 唯一标识：同 key 再次触发会就地替换而非新增一条 */
    key?: React.Key;
    /** 关闭回调 */
    onClose?: () => void;
    /** 气泡容器样式覆盖 */
    style?: StyleProp<ViewStyle>;
}
/** useMessage 的全局默认（对应 antd <App message={...}> 的 MessageConfig 全局项） */
export interface MessageOptions {
    /** 默认自动关闭延时（ms）；0 常驻 */
    duration?: number;
    /** 顶部偏移（px），叠加在默认 marginLG 之上 */
    top?: number;
    /** 同屏最大条数；超出淘汰最早的（缺省不限） */
    maxCount?: number;
}
/** useMessage 返回的命令式句柄 */
export interface MessageApi {
    /** 通用打开：传完整 config，返回该条 key */
    open: (config: MessageConfig) => React.Key;
    success: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    error: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    info: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    warning: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    loading: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => React.Key;
    /** 销毁全部（清空当前 holder 的消息栈） */
    destroy: () => void;
}
/** 声明式单条用法（向后兼容） */
export interface MessageProps {
    open?: boolean;
    type?: MessageType;
    content?: React.ReactNode;
    icon?: React.ReactNode;
    duration?: number;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
}
/**
 * antd v5 风格 hook：返回 [messageApi, contextHolder]。
 * 把 contextHolder 渲染进组件（锚点加载），用 messageApi.info/success/... 命令式触发提示。
 */
export declare function useMessage(options?: MessageOptions): [MessageApi, React.ReactElement];
/** 全局 message 对象：目前提供 hook 用法（useMessage）。无 portal，故不提供静态全局方法。 */
export declare const message: {
    useMessage: typeof useMessage;
};
/** 声明式单条用法（向后兼容）：open 时绝对定位铺满最近 relative 祖先，顶部居中显示一条。 */
export declare function Message(props: MessageProps): React.ReactElement | null;
export default message;
