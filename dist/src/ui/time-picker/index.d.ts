import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
type TimeSize = 'large' | 'middle' | 'small';
type TimePlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export interface TimePickerProps {

    value?: Date;
    defaultValue?: Date;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;

    showSecond?: boolean;

    use12Hours?: boolean;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;

    size?: TimeSize;

    status?: 'error' | 'warning';

    placement?: TimePlacement;

    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (d?: Date) => void;
}
export declare function TimePicker(props: TimePickerProps): React.ReactElement;
export default TimePicker;
