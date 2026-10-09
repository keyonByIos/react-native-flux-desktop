import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface MasonryItem {
    /** 稳定 key */
    key?: string | number;
    /** 条目高度（px），用于分列堆叠；图片条目按宽高比预先算好 */
    height: number;
    /** 业务字段透传给 renderItem */
    [k: string]: any;
}
export type MasonryGutter = number | 'small' | 'middle' | 'large';
export interface MasonryProps {
    data: MasonryItem[];
    /** 列数，默认 4 */
    columns?: number;
    /** 间距：数字或命名档；[水平, 垂直] 可分别设定。默认 middle */
    gutter?: MasonryGutter | [MasonryGutter, MasonryGutter];
    /** 渲染单个条目；外层已按 height 定高，内容撑满即可 */
    renderItem: (item: MasonryItem, index: number) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Masonry(props: MasonryProps): React.ReactElement;
export default Masonry;
