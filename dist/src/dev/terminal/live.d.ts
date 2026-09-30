import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { Screen } from './screen';
export { Screen };
export { TerminalView } from './view';
export interface LiveTerminalProps {

    title?: string;

    shell?: string;

    shellArgs?: string[];

    cols?: number;
    rows?: number;

    command?: string;

    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function LiveTerminal(props: LiveTerminalProps): React.ReactElement;
export default LiveTerminal;
