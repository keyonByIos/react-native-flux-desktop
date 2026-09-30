import React from 'react';
import { StyleProp, ViewStyle } from '../types';
import { type AnimPreset, type PresetName } from './presets';
export interface TransitionOptions {
    /** 入场预设（默认 slideUp） */
    enter?: AnimPreset | PresetName;
    /** 退场预设（默认 fade：只淡出不送回原位，收拢动作读作「消失」而非「移动」） */
    exit?: AnimPreset | PresetName;
}
/** 返回 { mounted, style }：调用方自行决定 mounted 期间渲染什么（style 含进出场插值结果）。 */
export declare function useTransition(visible: boolean, options?: TransitionOptions): {
    mounted: boolean;
    style: ViewStyle;
};
export interface TransitionProps extends TransitionOptions {
    visible: boolean;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
/** 包裹形态：visible 期间保持挂载并播进出场。 */
export declare function Transition(props: TransitionProps): React.ReactElement | null;
