import React from 'react';
import type { StyleProp, ViewStyle } from '../../types';
import { Screen } from './screen';
export declare const T_BG = "#0d1117";
export declare const T_TITLEBAR = "#161b22";
export declare const T_BORDER = "#30363d";
export declare const T_TEXT = "#c9d1d9";
export declare const T_PROMPT = "#3fb950";

export declare const KEY_SEQ: Record<string, string>;
export interface TerminalViewProps {

    screen: Screen;

    write: (s: string) => void;
    cols: number;
    rows: number;

    title: string;

    autoFocus?: boolean;

    statusText?: string;
    style?: StyleProp<ViewStyle>;
}

export declare function TerminalView(props: TerminalViewProps): React.ReactElement;
export default TerminalView;
