import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface BackTopProps {

    scrollY: number;

    visibilityHeight?: number;

    left?: number;
    top?: number;

    onPress?: () => void;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function BackTop(props: BackTopProps): React.ReactElement;
export default BackTop;
