import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type CalendarMode = 'month' | 'year';

export interface CalendarCellInfo {

    date: Date;

    year: number;

    month: number;

    day: number;

    selected: boolean;

    today: boolean;

    disabled: boolean;
}
export interface CalendarProps {

    value?: Date;
    defaultValue?: Date;
    onChange?: (d: Date) => void;

    month?: Date;

    mode?: CalendarMode;

    onPanelChange?: (date: Date, mode: CalendarMode) => void;

    validRange?: [Date, Date];

    disabledDate?: (current: Date) => boolean;

    modeSwitch?: boolean;

    dateCellRender?: (info: CalendarCellInfo) => React.ReactNode;

    dateFullCellRender?: (info: CalendarCellInfo) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Calendar(props: CalendarProps): React.ReactElement;
export default Calendar;
