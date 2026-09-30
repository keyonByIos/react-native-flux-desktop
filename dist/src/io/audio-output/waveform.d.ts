import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AudioWaveformProps {

    peaks: number[];

    progress?: number;

    height?: number;

    maxBars?: number;

    barWidth?: number;
    barGap?: number;

    playedColor?: string;
    restColor?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function AudioWaveform(props: AudioWaveformProps): React.ReactElement;
export default AudioWaveform;
