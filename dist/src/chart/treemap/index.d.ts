import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TreemapChartProps {
    data: Record<string, any>[];

    nameField?: string;

    valueField?: string;

    colorField?: string;
    width?: number;
    height?: number;

    gap?: number;

    label?: boolean;

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
