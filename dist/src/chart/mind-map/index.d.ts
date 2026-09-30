import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { TreeChartData } from '../core/tree-layout';
export interface MindMapChartProps {
    data: TreeChartData;
    width: number;
    height: number;

    side?: 'both' | 'right' | 'left';

    nodeStyle?: 'filled' | 'line' | 'box';

    nodeH?: number;

    padX?: number;

    levelGap?: number;

    leafGap?: number;

    fontSize?: number;

    lineWidth?: number;

    collapsible?: boolean;

    defaultCollapsed?: string[];

    onToggle?: (id: string, expanded: boolean) => void;
    animation?: boolean;
    animateDuration?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function MindMapChart(props: MindMapChartProps): React.ReactElement;
export default MindMapChart;
