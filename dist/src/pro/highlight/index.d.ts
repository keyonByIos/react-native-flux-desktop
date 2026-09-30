import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface HighlightProps {

    text: string;

    keyword?: string | string[];

    highlightAll?: boolean;

    caseSensitive?: boolean;

    color?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function Highlight(props: HighlightProps): React.ReactElement;
export default Highlight;
