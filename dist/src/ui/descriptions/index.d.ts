import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DescriptionsItem {
    key?: string | number;
    label: React.ReactNode;
    children?: React.ReactNode;

    span?: number;
}
export interface DescriptionsProps {
    title?: React.ReactNode;

    extra?: React.ReactNode;
    items?: DescriptionsItem[];
    column?: number;
    bordered?: boolean;

    layout?: 'horizontal' | 'vertical';

    size?: 'default' | 'middle' | 'small';

    colon?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Descriptions(props: DescriptionsProps): React.ReactElement;
