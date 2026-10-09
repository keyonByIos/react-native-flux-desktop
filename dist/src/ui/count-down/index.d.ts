import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from '../../types';
export interface CountDownParts {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}
export interface CountDownProps {
    /** 标题（数值上方小字） */
    title?: React.ReactNode;
    /** 截止时刻时间戳(ms)：Date.now() 起算 */
    value?: number;
    /** 剩余毫秒数（挂载起算）；与 value 二选一，value 优先 */
    leftTime?: number;
    /** 展示格式，支持 D/HH/mm/ss/SSS，默认 'HH:mm:ss' */
    format?: string;
    /** 暂停计时 */
    paused?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    onChange?: (time: CountDownParts) => void;
    onFinish?: () => void;
    /** 自定义渲染：传入拆分好的时间片，接管数值区域展示 */
    render?: (time: CountDownParts) => React.ReactNode;
    valueStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
}
export declare function CountDown(props: CountDownProps): React.ReactElement;
export default CountDown;
