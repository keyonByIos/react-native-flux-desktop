import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TabItem {
    key: string;
    label?: React.ReactNode;
    icon?: React.ReactNode | string;
    disabled?: boolean;
    children?: React.ReactNode;
    /** editable-card 下该项是否可关闭（默认 true；false 则不显示关闭图标） */
    closable?: boolean;
}
export interface TabsProps {
    items: TabItem[];
    activeKey?: string;
    defaultActiveKey?: string;
    onChange?: (key: string) => void;
    type?: 'line' | 'card' | 'editable-card';
    centered?: boolean;
    tabBarExtraContent?: React.ReactNode;
    /** 标签大小：large / middle / small */
    size?: 'large' | 'middle' | 'small';
    /** 标签栏位置：上 / 下 / 左 / 右 */
    tabPosition?: 'top' | 'bottom' | 'left' | 'right';
    /** 相邻标签间距（默认 token 组件级 horizontalItemGutter） */
    tabBarGutter?: number;
    /** editable-card 增删回调：action='add' 时 targetKey 为 undefined */
    onEdit?: (targetKey: string | undefined, action: 'add' | 'remove') => void;
    /** editable-card 隐藏右侧添加按钮 */
    hideAdd?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function Tabs(props: TabsProps): React.ReactElement;
export default Tabs;
