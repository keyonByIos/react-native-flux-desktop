import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type SpinSize = 'small' | 'default' | 'large';
export interface SpinProps {
    spinning?: boolean;
    size?: SpinSize;
    /** 自定义指示器（ReactNode）；默认用旋转弧线 */
    indicator?: React.ReactNode;
    tip?: React.ReactNode;
    /** 包裹内容：spinning 时内容变暗并在上方显示指示器 */
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Spin(props: SpinProps): React.ReactElement;
export default Spin;
