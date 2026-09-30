import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type SpaceSize = number | 'small' | 'middle' | 'large';
export interface SpaceProps {
    direction?: 'horizontal' | 'vertical';
    size?: SpaceSize | [SpaceSize, SpaceSize];
    align?: 'start' | 'end' | 'center' | 'baseline';
    wrap?: boolean;

    split?: React.ReactNode;

    block?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Space(props: SpaceProps): React.ReactElement;
