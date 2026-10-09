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
    /** 虚拟化：仅渲染视口内 ±overscan 行（万行级大数据）。开启需配合 itemHeight（固定行高）或 getItemHeight（变高），body 内部改用 VirtualList + 固定高视口 */
    virtual?: boolean;
    /** 虚拟化视口高（px）：List body 的内滚区高度。缺省 flex:1（由外层给界） */
    virtualHeight?: number;
    /** 虚拟化固定行高（px）：等高必需；提供 getItemHeight 时作为预估占位 */
    itemHeight?: number;
    /** 虚拟化变高行逐行取高（px）：提供即进入变高模式（数据驱动，规避本栈自适应文本列测高坑） */
    getItemHeight?: (index: number) => number;
    /** 虚拟化视口外上下各多渲染行数，默认 6 */
    overscan?: number;
    style?: StyleProp<ViewStyle>;
}
declare function ListBase<T>(props: ListProps<T>): React.ReactElement;
export declare const List: typeof ListBase & {
    Item: typeof ListItem;
};
export default List;
