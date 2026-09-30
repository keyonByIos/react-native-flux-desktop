import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface EmptyProps {
    description?: React.ReactNode;
    /** 自定义插画（ReactNode）；缺省用 inbox 矢量图 */
    image?: React.ReactNode;
    /** 插画容器样式（可覆盖尺寸） */
    imageStyle?: StyleProp<ViewStyle>;
    /** 默认插画尺寸（宽高按 1:0.85），传数字便于快捷设定 */
    imageSize?: number;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Empty(props: EmptyProps): React.ReactElement;
export default Empty;
