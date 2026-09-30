import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface DiffViewerProps {

    oldText: string;

    newText: string;

    variant?: 'unified' | 'split';

    title?: string;

    context?: number;

    showLineNumbers?: boolean;
    fontSize?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function DiffViewer(props: DiffViewerProps): React.ReactElement;
export default DiffViewer;
