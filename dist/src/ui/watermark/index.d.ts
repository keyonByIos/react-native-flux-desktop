import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from '../../types';
export interface WatermarkProps {
    /** 水印文字，支持多行数组 */
    content?: string | string[];
    /** 平铺间隔 [横向, 纵向] */
    gap?: [number, number];
    /** 字号 */
    fontSize?: number;
    /** 旋转角度（度），默认 -22 */
    rotate?: number;
    /** font 颜色（含透明度），不传走 colorText 低透明度 */
    fontColor?: string;
    /** 字重 */
    fontWeight?: TextStyle['fontWeight'];
    /** 字体 */
    fontFamily?: string;
    /** cover：覆盖在 children 上；embed：作为块自身展示 */
    mode?: 'cover' | 'embed';
    /** embed 模式下水印块的尺寸 */
    height?: number;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Watermark(props: WatermarkProps): React.ReactElement;
