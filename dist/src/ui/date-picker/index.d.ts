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
    /** 触发器尺寸 */
    size?: DateSize;
    /** 校验状态 */
    status?: 'error' | 'warning';
    /** 弹出方向 */
    placement?: DatePlacement;
    /** 禁用日期判定 */
    disabledDate?: (current: Date) => boolean;
    /** 格内追加内容（透传 Calendar） */
    dateCellRender?: (info: CalendarCellInfo) => React.ReactNode;
    /** 整格自定义渲染（透传 Calendar） */
    dateFullCellRender?: (info: CalendarCellInfo) => React.ReactNode;
    /** 面板内联常驻展开（demo 用） */
    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (d?: Date) => void;
}
export declare function DatePicker(props: DatePickerProps): React.ReactElement;
export {};
