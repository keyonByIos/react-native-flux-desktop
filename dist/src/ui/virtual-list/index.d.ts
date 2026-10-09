import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface VirtualListProps<T> {
    /** 全量数据 */
    data: T[];
    /** 行高：固定模式=真实等高；变高模式=预估占位高 */
    rowHeight: number;
    /** 渲染单行；index 为全局索引（稳定 key 依此） */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** 变高模式：true 时按 getItemHeight 逐行取高，窗口按累计偏移二分定位（默认 false=固定等高） */
    variable?: boolean;
    /** 变高模式逐行取高（px）；缺省回退 rowHeight。本栈内容自适应文本列测高不可靠，故行高由数据/回调显式给出 */
    getItemHeight?: (index: number) => number;
    /** 视口高度；缺省 flex:1（由外层给界，运行时经 onLayout 实测） */
    height?: number;
    /** 视口外上下各多渲染的行数（消白边），默认 6 */
    overscan?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function VirtualList<T>(props: VirtualListProps<T>): React.ReactElement;
export default VirtualList;
