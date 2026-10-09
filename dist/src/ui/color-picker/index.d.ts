import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
/** antd 官方预设 24 色（每色系取 50/100 两档中偏浅的一档 + 主档） */
export declare const PRESET_COLORS: string[];
type ColorSize = 'small' | 'middle' | 'large';
type ColorPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export interface ColorPickerProps {
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    /** 触发器尺寸 */
    size?: ColorSize;
    /** 触发器内是否显示色值文本；或自定义渲染函数 */
    showText?: boolean | ((color?: string) => React.ReactNode);
    /** 自定义预设色行（置于主色板上方） */
    presets?: string[];
    /** 允许清除（面板底部清除按钮） */
    allowClear?: boolean;
    /** 弹出方向 */
    placement?: ColorPlacement;
    /** 面板内联展示（demo/嵌入场景）；默认 false，点触发器开合 */
    open?: boolean;
    onChange?: (color: string) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function ColorPicker(props: ColorPickerProps): React.ReactElement;
export {};
