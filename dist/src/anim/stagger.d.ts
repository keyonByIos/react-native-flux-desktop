import React from 'react';
import { StyleProp, ViewStyle } from '../types';
import { type AnimPreset, type PresetName } from './presets';
export interface StaggerProps {
    children: React.ReactNode;
    /** 相邻子项的启动间隔（ms，默认 60） */
    gap?: number;
    /** 入场预设名（默认 slideUp） */
    preset?: PresetName;
    /** 自定义预设对象（优先于 preset 名） */
    animation?: AnimPreset;
    /** 首个子项前的整体延迟（ms） */
    delay?: number;
    style?: StyleProp<ViewStyle>;
}
/** 包裹一组子项：每个直接子项自动获得递增序号。 */
export declare function Stagger(props: StaggerProps): React.ReactElement;
export interface StaggerItemProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
/** 错峰子项：在 <Stagger> 内按序号延迟入场；脱离 Stagger 使用时等价 MoveIn(slideUp)。 */
export declare function StaggerItem(props: StaggerItemProps): React.ReactElement;
