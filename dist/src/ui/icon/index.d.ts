import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type IconName, type IconMode } from './paths';
export type { IconName, IconMode } from './paths';
export { iconPaths, getIconDef } from './paths';
export interface IconProps {
    /** 图标名，取自 paths.ts 字典 */
    name?: IconName | string;
    /** 原始 SVG path data：设置后绕过字典查找，直接绘制（供 Progress 圆弧等动态图形用） */
    path?: string;
    /** path 模式下的 viewBox 边长（px，映射到 size 盒）；默认 24 */
    vb?: number;
    /** 边长（px）。默认 token.fontSize，与同行文字对齐 */
    size?: number;
    /** 颜色。默认 token.colorText，随主题切换 */
    color?: string;
    /** 描边线宽（24 网格单位，随 size 等比缩放）。默认 2 */
    strokeWidth?: number;
    /** 绕中心旋转角度（度），供 Spin 等动画使用。默认 0 */
    rotate?: number;
    /** 绘制模式覆盖：path 模式默认 stroke，传 'fill' 可画实心图形（如 QR 码模块） */
    mode?: IconMode;
    /** 内置循环动画：spin 绕心旋转 · breath 呼吸（明暗 + 缩放脉动） */
    animate?: 'spin' | 'breath';
    /** 动画周期（ms），配合 animate；默认 spin 900、breath 1800 */
    animateDuration?: number;
    /** 额外样式（margin 等） */
    style?: StyleProp<ViewStyle>;
}
export declare function Icon(props: IconProps): React.ReactElement;
export default Icon;
