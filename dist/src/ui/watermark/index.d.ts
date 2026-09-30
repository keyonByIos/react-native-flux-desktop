import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from '../../types';
export interface WatermarkProps {

    content?: string | string[];

    gap?: [number, number];

    fontSize?: number;

    rotate?: number;

    fontColor?: string;

    fontWeight?: TextStyle['fontWeight'];

    fontFamily?: string;

    mode?: 'cover' | 'embed';

    height?: number;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Watermark(props: WatermarkProps): React.ReactElement;
