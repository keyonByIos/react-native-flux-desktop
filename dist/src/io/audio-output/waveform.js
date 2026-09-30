"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioWaveform = AudioWaveform;
// AudioWaveform：把 peaks 数组画成播放器常见的对称波形条（中线上下镜像）。
// 纯展示组件——数据来自 io/audio/ffmpeg.computePeaks，进度着色由 progress(0..1) 驱动。
// 用一列 View 竖条实现（与现有图表条形同构，走自绘管线，无需新渲染能力）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
/** 把任意长度 peaks 降采样到 maxBars 根（每段取最大值，保波形轮廓）。 */
function downsample(peaks, maxBars) {
    const n = peaks.length;
    if (n <= maxBars)
        return peaks;
    const out = new Array(maxBars).fill(0);
    const per = n / maxBars;
    for (let b = 0; b < maxBars; b++) {
        const start = Math.floor(b * per);
        const end = Math.min(n, Math.floor((b + 1) * per));
        let m = 0;
        for (let i = start; i < end; i++)
            if (peaks[i] > m)
                m = peaks[i];
        out[b] = m;
    }
    return out;
}
function AudioWaveform(props) {
    const { token } = (0, theme_1.useToken)();
    const { peaks, progress = 0, height = 48, maxBars = 160, barWidth = 3, barGap = 1, playedColor, restColor, style } = props;
    const bars = downsample(peaks && peaks.length ? peaks : [0], maxBars);
    const played = playedColor || token.colorPrimary;
    const rest = restColor || token.colorFill;
    const playedCount = Math.round(progress * bars.length);
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', height, overflow: 'hidden' }, style] }, bars.map((p, i) => {
        const h = Math.max(2, Math.min(1, p) * height);
        return (react_1.default.createElement(components_1.View, { key: i, style: {
                width: barWidth,
                height: h,
                marginRight: barGap,
                borderRadius: barWidth / 2,
                backgroundColor: i < playedCount ? played : rest,
            } }));
    })));
}
exports.default = AudioWaveform;
