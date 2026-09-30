import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface MarkdownProps {
    content: string;

    defaultCodeLang?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function Markdown(props: MarkdownProps): React.ReactElement;
export default Markdown;
