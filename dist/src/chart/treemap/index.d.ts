import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TreemapChartProps {
    data: Record<string, any>[];
    /** 名称字段 */
    nameField?: string;
    /** 数值字段（面积依据；≤0 项不画） */
    valueField?: string;
    /** 分组字段（决定颜色与图例）；缺省按叶子序号着色 */
    colorField?: string;
    width?: number;
    height?: number;
    /** cell 间隙（px） */
    gap?: number;
    /** cell 内标签（名称 + 值；空间不足自动不画） */
    label?: boolean;
    /** 逐块悬浮提示（默认开） */
    tooltip?: boolean;
    color?: string | string[];
    legend?: boolean;
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function TreemapChart(props: TreemapChartProps): React.ReactElement;
export default TreemapChart;
