import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface FloatButtonProps {
    icon?: React.ReactNode | string;
    /** 图标下方的描述文字（antd 命名） */
    description?: React.ReactNode;
    /** description 别名 */
    text?: React.ReactNode;
    badge?: React.ReactNode | number;
    type?: 'default' | 'primary';
    shape?: 'circle' | 'square';
    size?: number;
    /** 点击回调（桌面端首选命名） */
    onClick?: () => void;
    /** onClick 别名（移动端语义，逐步收敛） */
    onPress?: () => void;
    /** 悬停左侧文字提示 */
    tooltip?: string;
    /** tooltip 别名（antd 原生 title 语义） */
    title?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function FloatButtonBase(props: FloatButtonProps): React.ReactElement;
export interface FloatButtonGroupProps {
    children?: React.ReactNode;
    shape?: 'circle' | 'square';
    /** 展开触发方式；不传则子项常驻显示（旧行为） */
    trigger?: 'click' | 'hover';
    /** 受控展开态 */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** 触发主按钮收起态的图标（trigger 模式下有效） */
    icon?: React.ReactNode | string;
    /** 展开后主按钮切换成的图标（默认 close） */
    closeIcon?: React.ReactNode | string;
    style?: StyleProp<ViewStyle>;
}
export declare function Group(props: FloatButtonGroupProps): React.ReactElement;
/** FloatButton + FloatButton.Group 复合导出 */
export declare const FloatButton: typeof FloatButtonBase & {
    Group: typeof Group;
};
export default FloatButton;
