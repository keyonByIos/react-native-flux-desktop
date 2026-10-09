import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PopconfirmProps {
    /** 主标题 */
    title?: React.ReactNode;
    /** 补充描述（次级文字） */
    description?: React.ReactNode;
    /** 触发器（children） */
    children: React.ReactNode;
    /** 受控展开 */
    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** 确定按钮文案 */
    okText?: React.ReactNode;
    /** 取消按钮文案 */
    cancelText?: React.ReactNode;
    /** 隐藏取消按钮 */
    hideCancel?: boolean;
    /** 确定按钮危险态（红色） */
    danger?: boolean;
    /** 确定按钮加载中 */
    okButtonLoading?: boolean;
    /** 前置图标，默认警告圆圈；传 null 隐藏 */
    icon?: React.ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
    onOpenChange?: (open: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Popconfirm(props: PopconfirmProps): React.ReactElement;
export default Popconfirm;
