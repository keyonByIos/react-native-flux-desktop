import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface JsonViewerProps {

    data: unknown;

    title?: string;

    defaultExpandedDepth?: number;

    copyable?: boolean;
    fontSize?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function JsonViewer(props: JsonViewerProps): React.ReactElement;
export default JsonViewer;
