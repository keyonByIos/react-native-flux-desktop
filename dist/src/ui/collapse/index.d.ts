import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CollapseItem {
    key: string;
    label?: React.ReactNode;
    children?: React.ReactNode;

    icon?: React.ReactNode | string;
    disabled?: boolean;
}
export interface CollapseProps {
    items: CollapseItem[];

    activeKey?: string[];
    defaultActiveKey?: string[];
    onChange?: (keys: string[]) => void;

    accordion?: boolean;

    bordered?: boolean;
    ghost?: boolean;

    expandIconPosition?: 'start' | 'end';

    size?: 'large' | 'default';

    collapsible?: 'header' | 'icon' | 'disabled';

    expandIcon?: (info: {
        isActive: boolean;
    }) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Collapse(props: CollapseProps): React.ReactElement;
export default Collapse;
