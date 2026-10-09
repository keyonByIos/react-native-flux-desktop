import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CalendarHeatmapProps {
    /** 数据：每项 { [dateField]: 'YYYY-MM-DD', [valueField]: number } */
    data: Record<string, any>[];
    dateField?: string;
    valueField?: string;
    /** 单元格边长 */
    cellSize?: number;
    /** 单元格间隙 */
    cellGap?: number;
    /** 每周起始日 0=周日 .. 6=周六 */
    startOfWeek?: number;
    /** 基准色（alpha 随值递增），缺省主色 */
    color?: string;
    /** 离散色阶级数（缺省连续） */
    levels?: number;
    /** 月份标签（12 项，缺省英文） */
    monthNames?: string[];
    /** 星期短标签（7 项，索引=实际星期 0=周日） */
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
