import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type TagPreset = 'default' | 'success' | 'processing' | 'error' | 'warning';
export interface TagProps {
    color?: TagPreset | string;
    bordered?: boolean;
    closable?: boolean;
    /** 前置图标（图标名或自定义节点） */
    icon?: string | React.ReactNode;
    onClose?: () => void;
    /** 点击回调（桌面端统一 onClick；onPress 为等价别名） */
    onClick?: () => void;
    onPress?: () => void;
    /** 显式指定文字色；缺省对齐 Text（token.colorText），预设语义色不再充当文字色 */
    textColor?: string;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function TagBase(props: TagProps): React.ReactElement;
export interface CheckableTagProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function CheckableTag(props: CheckableTagProps): React.ReactElement;
/** Tag + Tag.CheckableTag 复合导出 */
export declare const Tag: typeof TagBase & {
    CheckableTag: typeof CheckableTag;
};
export default Tag;
