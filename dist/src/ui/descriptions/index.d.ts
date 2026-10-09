import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DescriptionsItem {
    key?: string | number;
    label: React.ReactNode;
    children?: React.ReactNode;
    /** 占据的列数，默认 1 */
    span?: number;
}
export interface DescriptionsProps {
    title?: React.ReactNode;
    /** 标题行右侧额外内容 */
    extra?: React.ReactNode;
    items?: DescriptionsItem[];
    column?: number;
    bordered?: boolean;
    /** 布局：horizontal 标题与内容同行 / vertical 标题在上内容在下 */
    layout?: 'horizontal' | 'vertical';
    /** 尺寸（仅 bordered 生效） */
    size?: 'default' | 'middle' | 'small';
    /** 非 bordered 下 label 后是否带冒号 */
    colon?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Descriptions(props: DescriptionsProps): React.ReactElement;
