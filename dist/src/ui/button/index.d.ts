import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonShape = 'default' | 'circle' | 'round';
export interface ButtonProps {
    type?: ButtonType;
    size?: ButtonSize;
    /** 形状：default 常规圆角 · circle 圆形（纯图标）· round 胶囊 */
    shape?: ButtonShape;
    danger?: boolean;
    disabled?: boolean;
    block?: boolean;
    /** 幽灵按钮：背景透明，边框/文字取主色，用于深色或彩色底上 */
    ghost?: boolean;
    /** 自定义主色（任意 hex/rgb）：参照 antd 色板派生 hover/active，覆盖 type/danger 的默认配色 */
    color?: string;
    /** 加载中：置灰并拦截点击，文案前放一个占位圈 */
    loading?: boolean;
    onPress?: () => void;
    /** antd 命名别名，等价于 onPress */
    onClick?: () => void;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Button(props: ButtonProps): React.ReactElement;
