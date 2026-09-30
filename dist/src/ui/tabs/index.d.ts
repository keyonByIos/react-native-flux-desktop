import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TabItem {
    key: string;
    label?: React.ReactNode;
    icon?: React.ReactNode | string;
    disabled?: boolean;
    children?: React.ReactNode;

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

    size?: 'large' | 'middle' | 'small';

    tabPosition?: 'top' | 'bottom' | 'left' | 'right';

    tabBarGutter?: number;

    onEdit?: (targetKey: string | undefined, action: 'add' | 'remove') => void;

    hideAdd?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function Tabs(props: TabsProps): React.ReactElement;
export default Tabs;
