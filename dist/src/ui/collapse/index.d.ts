import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CollapseItem {
    key: string;
    label?: React.ReactNode;
    children?: React.ReactNode;
    /** 面板左侧图标 */
    icon?: React.ReactNode | string;
    disabled?: boolean;
}
export interface CollapseProps {
    items: CollapseItem[];
    /** 受控：展开的 key 列表 */
    activeKey?: string[];
    defaultActiveKey?: string[];
    onChange?: (keys: string[]) => void;
    /** 手风琴：同时只允许展开一个 */
    accordion?: boolean;
    /** 边框态（antd bordered） */
    bordered?: boolean;
    ghost?: boolean;
    /** 折叠箭头位置：start 头部左 / end 头部右 */
    expandIconPosition?: 'start' | 'end';
    /** 尺寸：large 头部更宽松 */
    size?: 'large' | 'default';
    /** 触发区域：header 整行可点 / icon 仅箭头可点 / disabled 禁用（antd collapsible） */
    collapsible?: 'header' | 'icon' | 'disabled';
    /** 自定义箭头 */
    expandIcon?: (info: {
        isActive: boolean;
    }) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Collapse(props: CollapseProps): React.ReactElement;
export default Collapse;
