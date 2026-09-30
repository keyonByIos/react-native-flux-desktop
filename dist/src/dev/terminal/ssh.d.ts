import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface SshTerminalProps {

    defaultHost?: string;

    defaultPort?: number;

    defaultUser?: string;

    cols?: number;
    rows?: number;
    title?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function SshTerminal(props: SshTerminalProps): React.ReactElement;
export default SshTerminal;
