import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type GutterSize = number | 'small' | 'middle' | 'large';
/** justify：兼容 antd 关键字（start/end）与 CSS flexbox 值 */
declare const JUSTIFY: Record<string, ViewStyle['justifyContent']>;
/** align：兼容 antd 关键字（top/middle/bottom）与 CSS flexbox 值 */
declare const ALIGN: Record<string, ViewStyle['alignItems']>;
export interface RowProps {
    children?: React.ReactNode;
    /** 间距：数字或命名档；[水平, 垂直] 元组可分别设定 */
    gutter?: GutterSize | [GutterSize, GutterSize];
    wrap?: boolean;
    justify?: keyof typeof JUSTIFY;
    align?: keyof typeof ALIGN;
    style?: StyleProp<ViewStyle>;
}
export declare function Row(props: RowProps): React.ReactElement;
export interface ColProps {
    children?: React.ReactNode;
    /** 占据的栅格数（0-24） */
    span?: number;
    /** 偏移栅格数 */
    offset?: number;
    /** 弹性值：数字=按该比例分配；'auto'=按内容自适应。设置后覆盖 span */
    flex?: number | 'auto';
    style?: StyleProp<ViewStyle>;
}
export declare function Col(props: ColProps): React.ReactElement;
export default Row;
