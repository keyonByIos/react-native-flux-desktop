import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type TimelineColor = 'blue' | 'green' | 'red' | 'gray' | string;
export type TimelineMode = 'left' | 'right' | 'alternate';
export interface TimelineItem {
    key?: string | number;
    color?: TimelineColor;
    children?: React.ReactNode;
    /** 自定义节点：替代默认圆点（如 Icon） */
    dot?: React.ReactNode;
    /** 标签（alternate 模式显示在轴线另一侧；left/right 模式显示于内容上方） */
    label?: React.ReactNode;
    /** 强制该 item 所在侧（alternate / 双列布局） */
    position?: 'left' | 'right';
    content?: React.ReactNode;
}
export interface TimelineProps {
    items?: TimelineItem[];
    /** 排布模式，默认 left */
    mode?: TimelineMode;
    /** 尾部待定节点（灰色） */
    pending?: React.ReactNode;
    /** 反序展示 */
    reverse?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Timeline(props: TimelineProps): React.ReactElement;
export default Timeline;
