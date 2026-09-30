import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type AudioState } from '../audio/engine';
export interface AudioOutputProps {

    src?: string;
    title?: string;
    artist?: string;

    defaultVolume?: number;

    loop?: boolean;

    autoPlay?: boolean;

    showFilePicker?: boolean;

    showWaveform?: boolean;
    onState?: (s: AudioState) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function AudioOutput(props: AudioOutputProps): React.ReactElement;
export default AudioOutput;
