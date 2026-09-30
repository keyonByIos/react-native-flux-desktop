import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;

    loading?: boolean;
    size?: 'small' | 'default';

    checkedChildren?: React.ReactNode;

    unCheckedChildren?: React.ReactNode;
    onChange?: (checked: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Switch(props: SwitchProps): React.ReactElement;
