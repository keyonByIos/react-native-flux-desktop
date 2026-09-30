import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type CalendarMode = 'month' | 'year';
/** 传入自定义渲染函数的单元格信息（选中态作为一个字段给出，供区分选中/未选中渲染） */
export interface CalendarCellInfo {
    /** 该格代表的绝对时刻（取该时区当日正午），点击回调 value 与 date 一致 */
    date: Date;
    /** 年（该时区） */
    year: number;
    /** 月 0-11（该时区） */
    month: number;
    /** 日 1-31（该时区） */
    day: number;
    /** 是否为当前选中日期 */
    selected: boolean;
    /** 是否为「今天」（按全局时区） */
    today: boolean;
    /** 是否被禁用（validRange / disabledDate 命中） */
    disabled: boolean;
}
export interface CalendarProps {
    /** 受控选中日期（绝对时刻，读写均按全局时区拆解） */
    value?: Date;
    defaultValue?: Date;
    onChange?: (d: Date) => void;
    /** 面板固定显示的月份，不传则随选中/今天 */
    month?: Date;
    /** 展示模式：month 月历 / year 年历 */
    mode?: CalendarMode;
    /** 模式或面板日期变化时回调 */
    onPanelChange?: (date: Date, mode: CalendarMode) => void;
    /** 可选区间 [起, 止]，区间外禁用 */
    validRange?: [Date, Date];
    /** 禁用日期判定：返回 true 的日期不可选并灰显 */
    disabledDate?: (current: Date) => boolean;
    /** 头部显示「月/年」切换按钮（默认关，避免嵌入 DatePicker 时冗余） */
    modeSwitch?: boolean;
    /** 自定义格内追加内容（保留默认日期数字，在其内叠加角标/徽标等） */
    dateCellRender?: (info: CalendarCellInfo) => React.ReactNode;
    /** 整格自定义渲染（替换默认日期格，仍保持可点击选中；含选中态入参） */
    dateFullCellRender?: (info: CalendarCellInfo) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Calendar(props: CalendarProps): React.ReactElement;
export default Calendar;
