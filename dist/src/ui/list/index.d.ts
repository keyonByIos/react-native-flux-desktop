import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface ListItemProps {
    children?: React.ReactNode;

    actions?: React.ReactNode[];

    extra?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function ListItem(props: ListItemProps): React.ReactElement;
export interface ListProps<T> {
    dataSource?: T[];
    renderItem?: (item: T, index: number) => React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    bordered?: boolean;
    split?: boolean;
    size?: 'default' | 'small' | 'large';
    loading?: boolean;

    itemLayout?: 'horizontal' | 'vertical';

    loadMore?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function ListBase<T>(props: ListProps<T>): React.ReactElement;
export declare const List: typeof ListBase & {
    Item: typeof ListItem;
};
export default List;
