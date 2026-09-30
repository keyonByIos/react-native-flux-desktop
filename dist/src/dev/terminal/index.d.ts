import React from 'react';
import { StyleProp, ViewStyle } from '../../types';

export type TermKind = 'cmd' | 'out' | 'ok' | 'err' | 'warn' | 'info' | 'muted';
export interface TermLine {

    text: string;

    kind?: TermKind;

    prompt?: boolean;
}
export interface TerminalProps {

    title?: string;

    lines: TermLine[];

    promptText?: string;

    fontSize?: number;

    showCursor?: boolean;

    height?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Terminal(props: TerminalProps): React.ReactElement;
export default Terminal;
