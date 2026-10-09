import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type OrgChartData } from '../core/org-layout';
export interface OrgChartProps {
    data: OrgChartData;
    width: number;
    height: number;
    /** 排布方向：vertical = 根在顶向下（默认）；horizontal = 根在左向右 */
    direction?: 'vertical' | 'horizontal';
    /** 节点样式 */
    nodeStyle?: 'simple' | 'card';
    /** 横向盒尺寸（simple 建议 70×36；card 建议 150×46） */
    nodeW?: number;
    /** 纵向盒尺寸 */
    nodeH?: number;
    /** 兄弟间距（交叉轴） */
    gapX?: number;
    /** 层间距（深度轴） */
    gapY?: number;
    /** 四周留白 */
    padding?: number;
    /** simple 块字号 */
    fontSize?: number;
    /** 卡片姓名/职务字号 */
    nameFont?: number;
    subFont?: number;
    /** 连线宽度 */
    lineWidth?: number;
    animation?: boolean;
    animateDuration?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function OrgChart(props: OrgChartProps): React.ReactElement;
export default OrgChart;
