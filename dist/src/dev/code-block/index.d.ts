import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CodeBlockProps {
    code: string;

    language?: string;

    title?: React.ReactNode;

    showLineNumbers?: boolean;

    copyable?: boolean;

    wrap?: boolean;
    fontSize?: number;

    maxHeight?: number;

    startLine?: number;

    highlightLines?: number[];
    style?: StyleProp<ViewStyle>;
}
export declare function CodeBlock(props: CodeBlockProps): React.ReactElement;
export default CodeBlock;
