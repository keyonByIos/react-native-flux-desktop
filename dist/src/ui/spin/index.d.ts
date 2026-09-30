import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type SpinSize = 'small' | 'default' | 'large';
export interface SpinProps {
    spinning?: boolean;
    size?: SpinSize;

    indicator?: React.ReactNode;
    tip?: React.ReactNode;

    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Spin(props: SpinProps): React.ReactElement;
export default Spin;
