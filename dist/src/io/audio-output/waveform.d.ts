import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AudioWaveformProps {
    /** 归一化振幅 0..1 */
    peaks: number[];
    /** 播放进度 0..1：左侧条用主色、右侧用暗色 */
    progress?: number;
    /** 波形总高度（px），默认 48 */
    height?: number;
    /** 最多画多少根条（超出会按峰值降采样，避免节点过多），默认 160 */
    maxBars?: number;
    /** 单条宽度与间距（px） */
    barWidth?: number;
    barGap?: number;
    /** 覆盖配色（默认取 token：主色 / colorFill） */
    playedColor?: string;
    restColor?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function AudioWaveform(props: AudioWaveformProps): React.ReactElement;
export default AudioWaveform;
