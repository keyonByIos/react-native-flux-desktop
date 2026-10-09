import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
type TimeSize = 'large' | 'middle' | 'small';
type TimePlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export interface TimePickerProps {
    /** 受控选中时间（读其时/分/秒） */
    value?: Date;
    defaultValue?: Date;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    /** 显示秒列 */
    showSecond?: boolean;
    /** 12 小时制（附上下午列） */
    use12Hours?: boolean;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    /** 高度三档 */
    size?: TimeSize;
    /** 校验状态 */
    status?: 'error' | 'warning';
    /** 弹出方向 */
    placement?: TimePlacement;
    /** 面板内联常驻展开（demo 用） */
    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (d?: Date) => void;
}
export declare function TimePicker(props: TimePickerProps): React.ReactElement;
export default TimePicker;
