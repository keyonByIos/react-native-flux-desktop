import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface HighlightProps {
    /** 被搜索的完整文本 */
    text: string;
    /** 关键词（单个或多个；空串/空数组不高亮） */
    keyword?: string | string[];
    /** 是否高亮全部命中（false = 只高亮第一个），默认 true */
    highlightAll?: boolean;
    /** 大小写敏感，默认 false */
    caseSensitive?: boolean;
    /** 命中词颜色（默认主色） */
    color?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function Highlight(props: HighlightProps): React.ReactElement;
export default Highlight;
