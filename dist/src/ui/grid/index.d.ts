import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type GutterSize = number | 'small' | 'middle' | 'large';

declare const JUSTIFY: Record<string, ViewStyle['justifyContent']>;

declare const ALIGN: Record<string, ViewStyle['alignItems']>;
export interface RowProps {
    children?: React.ReactNode;

    gutter?: GutterSize | [GutterSize, GutterSize];
    wrap?: boolean;
    justify?: keyof typeof JUSTIFY;
    align?: keyof typeof ALIGN;
    style?: StyleProp<ViewStyle>;
}
export declare function Row(props: RowProps): React.ReactElement;
export interface ColProps {
    children?: React.ReactNode;

    span?: number;

    offset?: number;

    flex?: number | 'auto';
    style?: StyleProp<ViewStyle>;
}
export declare function Col(props: ColProps): React.ReactElement;
export default Row;
