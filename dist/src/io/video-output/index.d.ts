import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type FrameState } from '../video/frames';
export interface VideoOutputProps {
    /** 受控视频源（本地绝对路径或 URL）；不传则用内嵌选择器/内部状态 */
    src?: string;
    title?: string;
    /** 加载后自动播放 */
    autoPlay?: boolean;
    /** 内嵌文件选择器以挑选本地视频 */
    showFilePicker?: boolean;
    /** 解码长边上限（默认 640，控内存/CPU） */
    maxEdge?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    /** 舞台高度兜底（元信息未知时），默认 220 */
    height?: number;
    onState?: (s: FrameState) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function VideoOutput(props: VideoOutputProps): React.ReactElement;
export default VideoOutput;
