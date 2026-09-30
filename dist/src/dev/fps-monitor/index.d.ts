import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface FpsMonitorProps {

    intervalMs?: number;

    windowId?: number;

    maxPoints?: number;

    showChart?: boolean;

    showAll?: boolean;

    floating?: boolean;

    good?: number;

    warn?: number;

    label?: string;

    height?: number;
    style?: StyleProp<ViewStyle>;
}

export declare function useWindowFps(intervalMs?: number, windowId?: number, maxPoints?: number): {
    fps: number;
    history: number[];
};
export declare function FpsMonitor(props: FpsMonitorProps): React.ReactElement;
