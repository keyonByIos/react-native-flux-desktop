import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface BadgeProps {
    count?: number | string;
    dot?: boolean;
    /** 语义色或直接色值 */
    color?: 'error' | 'default' | 'processing' | 'success' | 'warning' | string;
    /** count 为 0 时是否仍显示 */
    showZero?: boolean;
    /** 数字超过该值显示为 {overflowCount}+，默认 99 */
    overflowCount?: number;
    /** [x, y] 微调，正值向右 / 向下 */
    offset?: [number, number];
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function BadgeBase(props: BadgeProps): React.ReactElement;
export interface RibbonProps {
    text?: React.ReactNode;
    /** 图标节点（优先于 text）：用于仅图标的角标，如卡片选中勾。避开 Text 不能内联嵌元素的限制 */
    icon?: React.ReactNode;
    color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | string;
    /** 绶带位置：start 左上 / end 右上（默认） */
    placement?: 'start' | 'end';
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Ribbon(props: RibbonProps): React.ReactElement;
export type BadgeStatusType = 'default' | 'error' | 'processing' | 'success' | 'warning';
export interface BadgeStatusProps {
    status?: BadgeStatusType;
    text?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Status(props: BadgeStatusProps): React.ReactElement;
/** Badge + Badge.Ribbon + Badge.Status 复合导出 */
export declare const Badge: typeof BadgeBase & {
    Ribbon: typeof Ribbon;
    Status: typeof Status;
};
