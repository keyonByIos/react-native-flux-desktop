import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SankeyLinkDatum {
    source: number | string;
    target: number | string;
    value: number;
}
export interface SankeyChartProps {

    nodes: (string | {
        name: string;
    })[];
    links: SankeyLinkDatum[];
    width?: number;
    height?: number;

    nodeWidth?: number;

    nodePadding?: number;

    label?: boolean;

    tooltip?: boolean;
    color?: string | string[];
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function SankeyChart(props: SankeyChartProps): React.ReactElement;
export default SankeyChart;
