import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type ProgressType = 'line' | 'circle' | 'dashboard';
export interface ProgressProps {
    type?: ProgressType;
    percent?: number;
    status?: 'normal' | 'success' | 'exception' | 'active';
    showInfo?: boolean;
    /** line 粗细档位 */
    size?: 'small' | 'default' | 'large';
    /** circle/dashboard 直径（px），默认 120 */
    width?: number;
    /** circle/dashboard 圆弧线宽（px）；默认 width*0.09 */
    strokeWidth?: number;
    strokeColor?: string;
    trailColor?: string;
    /** 自定义文本（line/circle/dashboard）；默认百分比 */
    format?: (percent: number) => string;
    /** line 分格数：>0 时渲染为分段色块 */
    steps?: number;
    /** 已完成的分段进度（绿色叠加，line） */
    success?: {
        percent?: number;
        strokeColor?: string;
    };
    /** dashboard 缺口角度（0-290），默认 75 */
    gapDegree?: number;
    /** dashboard 缺口位置，默认 bottom（circle 为 top） */
    gapPosition?: 'top' | 'bottom' | 'left' | 'right';
    style?: StyleProp<ViewStyle>;
}
export declare function Progress(props: ProgressProps): React.ReactElement;
