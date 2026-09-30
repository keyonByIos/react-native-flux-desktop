import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CalendarHeatmapProps {

    data: Record<string, any>[];
    dateField?: string;
    valueField?: string;

    cellSize?: number;

    cellGap?: number;

    startOfWeek?: number;

    color?: string;

    levels?: number;

    monthNames?: string[];

    weekdayNames?: string[];
    showMonthLabels?: boolean;
    showWeekdayLabels?: boolean;
    tooltip?: boolean;
    animation?: boolean;
    animateDuration?: number;
    valueFormatter?: (v: number) => string;
    style?: StyleProp<ViewStyle>;
}
export declare function CalendarHeatmapChart(props: CalendarHeatmapProps): React.ReactElement;
export default CalendarHeatmapChart;
