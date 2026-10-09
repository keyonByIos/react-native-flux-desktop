import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RoseChartProps {
    data: Record<string, any>[];
    /** 类目字段（图例 + 颜色依据） */
    xField?: string;
    /** 数值字段（决定半径） */
    yField?: string;
    /** 直径 */
    size?: number;
    /** 内径比例（0..0.9）；>0 即玫瑰环 */
    innerRadius?: number;
    /** 半径映射：radius 线性正比 / area 面积正比 */
    roseType?: 'radius' | 'area';
    color?: string | string[];
    legend?: boolean;
    /** 扇区间隙角（度） */
    padAngle?: number;
    /** 数据标签：花瓣顶端中角外侧显示数值（入场完成后浮现） */
    label?: boolean;
    /** 悬浮交互：命中花瓣外扩 + 邻瓣压暗 + tooltip 气泡（默认开） */
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function RoseChart(props: RoseChartProps): React.ReactElement;
export default RoseChart;
