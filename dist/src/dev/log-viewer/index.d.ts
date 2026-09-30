import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type LogEntry, type LogLevel } from './logs';
export interface LogViewerProps {
    logs: LogEntry[];

    height?: number;

    defaultMinLevel?: LogLevel;

    toolbar?: boolean;

    showTime?: boolean;

    showSource?: boolean;

    maxRows?: number;
    fontSize?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function LogViewer(props: LogViewerProps): React.ReactElement;
export default LogViewer;
