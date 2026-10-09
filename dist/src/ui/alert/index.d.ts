import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type AlertType = 'success' | 'info' | 'warning' | 'error';
export interface AlertProps {
    type?: AlertType;
    message?: React.ReactNode;
    description?: React.ReactNode;
    showIcon?: boolean;
    /** 自定义图标（配合 showIcon） */
    icon?: React.ReactNode;
    closable?: boolean;
    /** 关闭按钮文字（默认 ×） */
    closeText?: React.ReactNode;
    /** 顶部通告条样式：无圆角无边框 */
    banner?: boolean;
    /** 右侧操作区（如按钮） */
    action?: React.ReactNode;
    /** 长文本横向滚动（marquee）：仅当 message 为纯文本且超出可视宽时循环左移 */
    marquee?: boolean;
    /** 滚动速度（px/秒），默认 50 */
    marqueeSpeed?: number;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Alert(props: AlertProps): React.ReactElement | null;
export default Alert;
