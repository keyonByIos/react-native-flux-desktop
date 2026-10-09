import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SparklineChartProps {
    data: Record<string, any>[];
    yField?: string;
    /** 类目字段（tooltip 标题用；缺省用点序号） */
    xField?: string;
    /** 折线类型：line 仅线 / area 线 + 面积 */
    type?: 'line' | 'area';
    width?: number;
    height?: number;
    color?: string;
    /** 是否高亮末点 */
    endDot?: boolean;
    /** 平滑曲线（Catmull-Rom） */
    smooth?: boolean;
    /** 悬浮交互：准星 + 锚点 + 气泡（默认开） */
    tooltip?: boolean;
    /** 气泡数值格式化 */
    valueFormatter?: (v: number) => string;
    animation?: boolean;
    animateDuration?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function SparklineChart(props: SparklineChartProps): React.ReactElement;
export default SparklineChart;
