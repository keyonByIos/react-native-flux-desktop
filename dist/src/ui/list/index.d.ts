import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface ListItemProps {
    children?: React.ReactNode;
    /** 操作区：一排可点项，竖分隔线分隔 */
    actions?: React.ReactNode[];
    /** 右侧媒体/额外内容（仅 horizontal 生效） */
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
    /** item 内部布局：horizontal 图文左右 / vertical 上下 */
    itemLayout?: 'horizontal' | 'vertical';
    /** 列表整体右侧额外区（antd 的 loadMore 简化为尾部节点） */
    loadMore?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
declare function ListBase<T>(props: ListProps<T>): React.ReactElement;
export declare const List: typeof ListBase & {
    Item: typeof ListItem;
};
export default List;
