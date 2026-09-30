import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CascaderOption {
    label: React.ReactNode;
    value: string;
    disabled?: boolean;
    children?: CascaderOption[];
}
export interface CascaderProps {
    options: CascaderOption[];

    value?: string[];
    defaultValue?: string[];
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;

    size?: 'large' | 'middle' | 'small';

    placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

    expandTrigger?: 'click' | 'hover';

    changeOnSelect?: boolean;

    displayRender?: (labels: React.ReactNode[], selectedOptions: CascaderOption[]) => React.ReactNode;

    showArrow?: boolean;

    status?: 'error' | 'warning';

    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (value: string[], selectedOptions: CascaderOption[]) => void;
}
export declare function Cascader(props: CascaderProps): React.ReactElement;
export default Cascader;
