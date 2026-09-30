import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SliderProps {
    min?: number;
    max?: number;
    step?: number;
    /** 受控值 */
    value?: number;
    /** 非受控初值 */
    defaultValue?: number;
    disabled?: boolean;
    /** 刻度标记：键为数值，值为标签 */
    marks?: Record<number, React.ReactNode>;
    /** 常驻显示当前数值气泡 */
    tooltipVisible?: boolean;
    /** 数值格式化（气泡与默认标签） */
    formatter?: (v: number) => React.ReactNode;
    onChange?: (v: number) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Slider(props: SliderProps): React.ReactElement;
export default Slider;
