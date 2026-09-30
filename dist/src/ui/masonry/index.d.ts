import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface MasonryItem {

    key?: string | number;

    height: number;

    [k: string]: any;
}
export type MasonryGutter = number | 'small' | 'middle' | 'large';
export interface MasonryProps {
    data: MasonryItem[];

    columns?: number;

    gutter?: MasonryGutter | [MasonryGutter, MasonryGutter];

    renderItem: (item: MasonryItem, index: number) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Masonry(props: MasonryProps): React.ReactElement;
export default Masonry;
