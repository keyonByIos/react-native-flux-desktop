import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type FlexGap = 'small' | 'middle' | 'large' | number;
export interface FlexProps {
    children?: React.ReactNode;
    vertical?: boolean;
    wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    flex?: number | string;
    gap?: FlexGap | [FlexGap, FlexGap];
    style?: StyleProp<ViewStyle>;
}
export declare function Flex(props: FlexProps): React.ReactElement;
export default Flex;
