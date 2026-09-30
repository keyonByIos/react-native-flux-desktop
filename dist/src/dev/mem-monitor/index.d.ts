import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface MemMonitorProps {

    intervalMs?: number;

    maxPoints?: number;

    defaultOpen?: boolean;

    floating?: boolean;

    dropdown?: boolean;

    warnMB?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function MemMonitor(props: MemMonitorProps): React.ReactElement;
export default MemMonitor;
