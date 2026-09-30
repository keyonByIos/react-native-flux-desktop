import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface EmptyProps {
    description?: React.ReactNode;

    image?: React.ReactNode;

    imageStyle?: StyleProp<ViewStyle>;

    imageSize?: number;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Empty(props: EmptyProps): React.ReactElement;
export default Empty;
