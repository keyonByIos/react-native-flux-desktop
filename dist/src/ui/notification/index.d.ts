import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationPlacement = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
/** 单条通知的配置（hook 的 api.open / 类型方法皆可传入）——对齐 antd NotificationArgsProps 的核心子集 */
export interface NotificationConfig {
    /** 唯一标识：同 key 再次触发会就地替换而非新增一条 */
    key?: React.Key;
    /** 标题行 */
    title?: React.ReactNode;
    /** 描述正文 */
    description?: React.ReactNode;
    /** 通知类型（决定默认图标与配色） */
    type?: NotificationType;
    /** 自定义图标节点（覆盖类型默认图标） */
    icon?: React.ReactNode;
    /** 停靠角落（缺省取 useNotification 的全局 placement，再缺省 topRight） */
    placement?: NotificationPlacement;
    /** 自动关闭延时（ms）；0 表示常驻 */
    duration?: number;
    /** 关闭回调 */
    onClose?: () => void;
    /** 卡片点击回调 */
    onClick?: () => void;
    /** 底部操作区（如按钮） */
    btn?: React.ReactNode;
    /** 自定义关闭图标 */
    closeIcon?: React.ReactNode;
    /** 卡片样式覆盖 */
    style?: StyleProp<ViewStyle>;
}
/** useNotification 的全局默认（对应 antd <App notification={...}> 的 NotificationConfig 全局项） */
export interface NotificationOptions {
    /** 默认停靠角落 */
    placement?: NotificationPlacement;
    /** 默认自动关闭延时（ms）；0 常驻 */
    duration?: number;
    /** 顶部停靠时距顶的偏移（px） */
    top?: number;
    /** 底部停靠时距底的偏移（px） */
    bottom?: number;
    /** 同屏最大条数；超出淘汰最早的（缺省不限） */
    maxCount?: number;
}
/** useNotification 返回的命令式句柄 */
export interface NotificationApi {
    open: (config: NotificationConfig) => React.Key;
    success: (config: NotificationConfig) => React.Key;
    error: (config: NotificationConfig) => React.Key;
    info: (config: NotificationConfig) => React.Key;
    warning: (config: NotificationConfig) => React.Key;
    /** 销毁：传 key 关单条，不传清空全部 */
    destroy: (key?: React.Key) => void;
}
/** 声明式单条用法（向后兼容） */
export interface NotificationProps {
    open?: boolean;
    title?: React.ReactNode;
    description?: React.ReactNode;
    type?: NotificationType;
    placement?: NotificationPlacement;
    duration?: number;
    onClose?: () => void;
    /** 自定义图标名（字符串）；不传则按 type 选默认图标 */
    icon?: string;
    btn?: React.ReactNode;
    closeIcon?: React.ReactNode;
    onClick?: () => void;
    style?: StyleProp<ViewStyle>;
}
/**
 * antd v5 风格 hook：返回 [notificationApi, contextHolder]。
 * 把 contextHolder 渲染进组件（锚点加载），用 notificationApi.open/success/... 命令式触发通知。
 * options 为全局默认（placement / duration / top / bottom / maxCount），可被单条 config 覆盖。
 */
export declare function useNotification(options?: NotificationOptions): [NotificationApi, React.ReactElement];
/** 全局 notification 对象：目前提供 hook 用法（useNotification）。无 portal，故不提供静态全局方法。 */
export declare const notification: {
    useNotification: typeof useNotification;
};
/** 声明式单条用法（向后兼容）：open 时绝对定位停靠到最近 relative 祖先的对应角落。 */
export declare function Notification(props: NotificationProps): React.ReactElement | null;
export default notification;
