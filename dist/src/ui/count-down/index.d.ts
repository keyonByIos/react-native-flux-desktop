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

    title?: React.ReactNode;

    value?: number;

    leftTime?: number;

    format?: string;

    paused?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    onChange?: (time: CountDownParts) => void;
    onFinish?: () => void;

    render?: (time: CountDownParts) => React.ReactNode;
    valueStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
}
export declare function CountDown(props: CountDownProps): React.ReactElement;
export default CountDown;
