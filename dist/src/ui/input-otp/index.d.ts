import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface InputOTPProps {
    /** 格子数量，默认 6 */
    length?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    /** 全部填满后回调 */
    onComplete?: (v: string) => void;
    /** 掩码模式：显示 • 代替实际字符 */
    masked?: boolean;
    disabled?: boolean;
    /** 校验状态 */
    status?: 'error' | 'warning';
    /** 方向：vertical（默认横排） */
    direction?: 'horizontal' | 'vertical';
    style?: StyleProp<ViewStyle>;
}
export declare function InputOTP(props: InputOTPProps): React.ReactElement;
export default InputOTP;
