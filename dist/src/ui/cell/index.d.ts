import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CellProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    /** 左侧图标（字符串走 Icon，或传节点） */
    icon?: React.ReactNode | string;
    /** 右侧内容，通常是 Text / Switch / 值 */
    extra?: React.ReactNode;
    /** 右侧箭头（矢量 chevron） */
    arrow?: boolean;
    clickable?: boolean;
    /** 禁用：置灰且不响应点击 */
    disabled?: boolean;
    /** 点击回调（桌面端统一 onClick；onPress 为等价别名） */
    onClick?: () => void;
    onPress?: () => void;
    /** 是否显示底部分隔线 */
    bordered?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Cell(props: CellProps): React.ReactElement;
