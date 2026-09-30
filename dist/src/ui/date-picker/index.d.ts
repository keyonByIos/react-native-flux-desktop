import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type CalendarCellInfo } from '../calendar';
type DateSize = 'large' | 'middle' | 'small';
type DatePlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export interface DatePickerProps {
    value?: Date;
    defaultValue?: Date;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;

    size?: DateSize;

    status?: 'error' | 'warning';

    placement?: DatePlacement;

    disabledDate?: (current: Date) => boolean;

    dateCellRender?: (info: CalendarCellInfo) => React.ReactNode;

    dateFullCellRender?: (info: CalendarCellInfo) => React.ReactNode;

    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (d?: Date) => void;
}
export declare function DatePicker(props: DatePickerProps): React.ReactElement;
export {};
