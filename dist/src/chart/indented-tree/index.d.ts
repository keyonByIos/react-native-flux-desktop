import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { TreeChartData } from '../core/tree-layout';
export interface IndentedTreeProps {
    data: TreeChartData;
    width: number;
    height: number;

    side?: 'right' | 'left';

    nodeStyle?: 'filled' | 'line' | 'box';

    indent?: number;

    rowHeight?: number;

    nodeHeight?: number;

    nodeRadius?: number;

    fontSize?: number;

    paddingTop?: number;

    paddingStart?: number;

    colorByBranch?: boolean;

    lineWidth?: number;

    collapsible?: boolean;

    defaultCollapsed?: string[];

    onToggle?: (id: string, expanded: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function IndentedTree(props: IndentedTreeProps): React.ReactElement;
export default IndentedTree;
