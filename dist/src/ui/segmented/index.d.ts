import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type SegmentedOption = string | {
    label?: React.ReactNode;
    value?: string | number;
    icon?: React.ReactNode | string;
    disabled?: boolean;
};
export interface SegmentedProps {
    options: SegmentedOption[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (v: string | number) => void;
    size?: 'small' | 'middle' | 'large';
    block?: boolean;
    /** 整体禁用 */
    disabled?: boolean;
    /** 形状：default 圆角 / round 胶囊 */
    shape?: 'default' | 'round';
    style?: StyleProp<ViewStyle>;
}
export declare function Segmented(props: SegmentedProps): React.ReactElement;
export default Segmented;
