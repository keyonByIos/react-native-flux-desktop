import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    /** 加载态：手柄内显示旋转指示器且不可交互 */
    loading?: boolean;
    size?: 'small' | 'default';
    /** 开启时轨道内文字 / 图标 */
    checkedChildren?: React.ReactNode;
    /** 关闭时轨道内文字 / 图标 */
    unCheckedChildren?: React.ReactNode;
    onChange?: (checked: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Switch(props: SwitchProps): React.ReactElement;
