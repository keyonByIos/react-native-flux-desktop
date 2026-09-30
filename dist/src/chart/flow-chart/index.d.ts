import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type FlowGraphData } from '../core/flow-layout';
export interface FlowChartProps {
    graph: FlowGraphData;
    width: number;
    height: number;

    highlightOnClick?: boolean;

    selectedId?: string | null;
    defaultSelectedId?: string | null;
    onSelectChange?: (id: string | null) => void;
    nodeW?: number;
    nodeH?: number;
    nodeH2?: number;
    gapX?: number;
    gapY?: number;
    padding?: number;
    fontSize?: number;
    subFontSize?: number;
    animation?: boolean;
    animateDuration?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function FlowChart(props: FlowChartProps): React.ReactElement;
export default FlowChart;
