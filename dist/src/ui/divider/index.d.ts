import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DividerProps {
    type?: 'horizontal' | 'vertical';
    /** 线型（对齐 antd v5.13）：solid / dashed / dotted，优先级高于 dashed */
    variant?: 'solid' | 'dashed' | 'dotted';
    /** 虚线（旧版布尔，等价 variant='dashed'）；走描边路径（Skia setLineDash），实线直接填充更省事 */
    dashed?: boolean;
    /** 带文字时文字不加粗 */
    plain?: boolean;
    /** 带文字时分割线在文字处断开 */
    children?: React.ReactNode;
    /** 文字位置；'center' 之外会让一侧线段变短 */
    orientation?: 'left' | 'center' | 'right';
    style?: StyleProp<ViewStyle>;
}
export declare function Divider(props: DividerProps): React.ReactElement;
