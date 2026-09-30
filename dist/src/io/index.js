"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioEngine = exports.AudioWaveform = exports.AudioOutput = exports.ChartExportButton = exports.FileSaver = exports.saveFile = exports.pickFiles = exports.FilePicker = void 0;
// I/O 组件族：设备/系统级输入输出。当前提供文件选择器（点击 + 拖拽）与音频输出播放卡。
var file_picker_1 = require("./file-picker");
Object.defineProperty(exports, "FilePicker", { enumerable: true, get: function () { return file_picker_1.FilePicker; } });
var dialog_1 = require("./dialog");
Object.defineProperty(exports, "pickFiles", { enumerable: true, get: function () { return dialog_1.pickFiles; } });
Object.defineProperty(exports, "saveFile", { enumerable: true, get: function () { return dialog_1.saveFile; } });
var file_saver_1 = require("./file-saver");
Object.defineProperty(exports, "FileSaver", { enumerable: true, get: function () { return file_saver_1.FileSaver; } });
var chart_export_1 = require("./chart-export");
Object.defineProperty(exports, "ChartExportButton", { enumerable: true, get: function () { return chart_export_1.ChartExportButton; } });
var audio_output_1 = require("./audio-output");
Object.defineProperty(exports, "AudioOutput", { enumerable: true, get: function () { return audio_output_1.AudioOutput; } });
var waveform_1 = require("./audio-output/waveform");
Object.defineProperty(exports, "AudioWaveform", { enumerable: true, get: function () { return waveform_1.AudioWaveform; } });
var engine_1 = require("./audio/engine");
Object.defineProperty(exports, "createAudioEngine", { enumerable: true, get: function () { return engine_1.createAudioEngine; } });
// 以下依赖可选原生包 ffmpeg-static（已从分发包移除），故不再对外导出；源码文件保留。
// export { computePeaks, isFfmpegAvailable, resolveFfmpeg } from './audio/ffmpeg';
// export type { PeaksResult } from './audio/ffmpeg';
// export { VideoOutput } from './video-output';
// export type { VideoOutputProps } from './video-output';
// export { probe, FrameDecoder } from './video/frames';
// export type { VideoMeta, FrameState, FrameDecoderOptions } from './video/frames';
// export { ensureSampleVideo } from './video/sample';
