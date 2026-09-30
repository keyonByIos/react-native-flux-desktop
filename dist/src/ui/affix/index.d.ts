import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AffixProps {
    children: React.ReactNode;
    /** 钉住时距容器顶的距离（px）。默认 0 */
    offset?: number;
    /** 外层 ScrollView 当前滚动偏移（onScroll 里喂进来） */
    scrollY?: number;
    /** 钉住状态变化回调 */
    onAffix?: (affixed: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Affix(props: AffixProps): React.ReactElement;
export default Affix;
