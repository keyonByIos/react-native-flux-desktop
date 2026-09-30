import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type OrgChartData } from '../core/org-layout';
export interface OrgChartProps {
    data: OrgChartData;
    width: number;
    height: number;

    direction?: 'vertical' | 'horizontal';

    nodeStyle?: 'simple' | 'card';

    nodeW?: number;

    nodeH?: number;

    gapX?: number;

    gapY?: number;

    padding?: number;

    fontSize?: number;

    nameFont?: number;
    subFont?: number;

    lineWidth?: number;
    animation?: boolean;
    animateDuration?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function OrgChart(props: OrgChartProps): React.ReactElement;
export default OrgChart;
