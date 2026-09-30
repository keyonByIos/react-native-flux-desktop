import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type AudioState } from '../audio/engine';
export interface AudioOutputProps {
    /** 受控音源（本地绝对路径或 URL）；不传则用内嵌选择器/内部状态 */
    src?: string;
    title?: string;
    artist?: string;
    /** 初始音量 0..1 */
    defaultVolume?: number;
    /** 初始循环 */
    loop?: boolean;
    /** 加载后自动播放 */
    autoPlay?: boolean;
    /** 内嵌文件选择器以挑选本地音频 */
    showFilePicker?: boolean;
    /** 显示波形条（opt-in）：WAV 纯 Node 解析，其它格式需系统 ffmpeg（可选依赖，缺失则降级提示） */
    showWaveform?: boolean;
    onState?: (s: AudioState) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function AudioOutput(props: AudioOutputProps): React.ReactElement;
export default AudioOutput;
