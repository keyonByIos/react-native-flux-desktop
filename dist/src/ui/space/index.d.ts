import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type SpaceSize = number | 'small' | 'middle' | 'large';
export interface SpaceProps {
    direction?: 'horizontal' | 'vertical';
    size?: SpaceSize | [SpaceSize, SpaceSize];
    align?: 'start' | 'end' | 'center' | 'baseline';
    wrap?: boolean;
    /** 子项之间的分隔符（对齐 antd split）；作为 flex 子项随 gap 一起排布 */
    split?: React.ReactNode;
    /** 占满父容器宽度（对齐 antd block） */
    block?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Space(props: SpaceProps): React.ReactElement;
