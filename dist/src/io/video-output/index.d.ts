import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type FrameState } from '../video/frames';
export interface VideoOutputProps {

    src?: string;
    title?: string;

    autoPlay?: boolean;

    showFilePicker?: boolean;

    maxEdge?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';

    height?: number;
    onState?: (s: FrameState) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function VideoOutput(props: VideoOutputProps): React.ReactElement;
export default VideoOutput;
