import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface BackTopProps {
    /** 当前滚动偏移（ScrollView onScroll 里拿来喂） */
    scrollY: number;
    /** 超过该高度显示（px）。默认 120 */
    visibilityHeight?: number;
    /** 相对内容容器左上角的定位 */
    left?: number;
    top?: number;
    /** 点击回顶 */
    onPress?: () => void;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function BackTop(props: BackTopProps): React.ReactElement;
export default BackTop;
