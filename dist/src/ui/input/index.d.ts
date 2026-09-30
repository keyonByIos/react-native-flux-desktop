import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import type { KeyMods } from '../../events/editable';
export interface InputProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    maxLength?: number;
    autoFocus?: boolean;
    size?: 'large' | 'middle' | 'small';
    status?: 'error' | 'warning';
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    /** 聚焦且有值时显示清除按钮 */
    allowClear?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (v: string) => void;
    onPressEnter?: (v: string) => void;
    /** 命名键逃生口（antd 同名 API）：先于默认编辑行为调用；返回 true 表示已消费（如命令面板抢 ↑↓） */
    onKeyDown?: (key: string, mods: KeyMods) => boolean | void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export declare function Input(props: InputProps): React.ReactElement;
export default Input;
