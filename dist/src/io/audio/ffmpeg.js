"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFfmpeg = resolveFfmpeg;
exports.isFfmpegAvailable = isFfmpegAvailable;
exports.computePeaks = computePeaks;
// 波形数据（peaks）计算：把音频解码成振幅数组，供 AudioWaveform 画播放器常见的对称波形条。
//
// ⚠️ 设计前提（学习用途 / 生产可选）：本模块不在加载时 spawn 进程；ffmpeg 仅作**可选依赖**
//   接入（package.json 的 optionalDependencies：ffmpeg-static），未安装时 require 失败被吞、照常降级。
//   - WAV：纯 Node 解析 RIFF/PCM，零外部依赖即可出波形（学习/演示主路径）。
//   - 其它格式（mp3/m4a/flac…）：运行时探测 ffmpeg，优先级 FLUX_FFMPEG_PATH 环境变量 →
//     optionalDependencies 里的 ffmpeg-static（装了即自带二进制）→ PATH 上的 ffmpeg；
//     有则 spawn ffmpeg 解成裸 PCM 再算 peaks；无则返回 null，由上层显示「需要 ffmpeg」降级提示。
//   故未装 ffmpeg 的生产环境完全不受影响，只有显式开启波形且喂非 WAV 文件时才会用到它。
const child_process_1 = require("child_process");
const fs_1 = require("fs");
/** ffmpeg 路径探测结果缓存：undefined=未探测，null=不可用，string=可用命令/路径 */
let ffmpegCached;
/** 解析出可用的 ffmpeg 命令路径（FLUX_FFMPEG_PATH → ffmpeg-static 包 → PATH 上的 ffmpeg）；不可用返回 null。 */
function resolveFfmpeg() {
    if (ffmpegCached !== undefined)
        return ffmpegCached;
    const candidates = [];
    if (process.env.FLUX_FFMPEG_PATH)
        candidates.push(process.env.FLUX_FFMPEG_PATH);
    try {
        // optionalDependencies 里的 ffmpeg-static：装了即自带二进制，没装 require 抛错被吞
        const staticPath = require('ffmpeg-static');
        if (typeof staticPath === 'string' && staticPath)
            candidates.push(staticPath);
    }
    catch {
        /* 未安装 ffmpeg-static，继续走 PATH */
    }
    candidates.push('ffmpeg');
    let found = null;
    for (const c of candidates) {
        try {
            const r = (0, child_process_1.spawnSync)(c, ['-version'], { windowsHide: true, timeout: 4000 });
            if (!r.error && r.status === 0) {
                found = c;
                break;
            }
        }
        catch {
            /* 继续试下一个候选 */
        }
    }
    ffmpegCached = found;
    return found;
}
/** ffmpeg 是否可用（用于 UI 决定是否提示降级）。 */
function isFfmpegAvailable() {
    return resolveFfmpeg() !== null;
}
function isHttp(src) {
    return /^https?:\/\//i.test(src);
}
/** 把一串单声道样本（-1..1 或任意量纲）按桶取最大绝对值 → 归一 0..1。 */
function bucketPeaks(samples, buckets) {
    const n = samples.length;
    const out = new Array(buckets).fill(0);
    if (n === 0)
        return out;
    const per = n / buckets;
    for (let b = 0; b < buckets; b++) {
        const start = Math.floor(b * per);
        const end = Math.min(n, Math.floor((b + 1) * per));
        let peak = 0;
        for (let i = start; i < end; i++) {
            const a = samples[i] < 0 ? -samples[i] : samples[i];
            if (a > peak)
                peak = a;
        }
        out[b] = peak;
    }
    let max = 0;
    for (const v of out)
        if (v > max)
            max = v;
    if (max > 0)
        for (let i = 0; i < out.length; i++)
            out[i] = out[i] / max;
    return out;
}
/** 解析 WAV(RIFF) 字节 → 单声道归一样本。支持 8/16/24/32 位整型与 32 位浮点；多声道取均值。 */
function parseWav(buf) {
    if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
        return null;
    }
    let audioFormat = 1;
    let numChannels = 1;
    let bitsPerSample = 16;
    let dataOffset = -1;
    let dataLength = 0;
    let pos = 12;
    while (pos + 8 <= buf.length) {
        const id = buf.toString('ascii', pos, pos + 4);
        const size = buf.readUInt32LE(pos + 4);
        const body = pos + 8;
        if (id === 'fmt ') {
            audioFormat = buf.readUInt16LE(body);
            numChannels = buf.readUInt16LE(body + 2) || 1;
            bitsPerSample = buf.readUInt16LE(body + 14) || 16;
        }
        else if (id === 'data') {
            dataOffset = body;
            dataLength = Math.min(size, buf.length - body);
        }
        pos = body + size + (size % 2); // chunk 按偶数字节对齐
    }
    if (dataOffset < 0 || dataLength <= 0)
        return null;
    const bytesPerSample = bitsPerSample / 8;
    const frameCount = Math.floor(dataLength / (bytesPerSample * numChannels));
    const mono = new Float64Array(frameCount);
    const isFloat = audioFormat === 3;
    for (let f = 0; f < frameCount; f++) {
        let sum = 0;
        for (let ch = 0; ch < numChannels; ch++) {
            const off = dataOffset + (f * numChannels + ch) * bytesPerSample;
            let s = 0;
            if (isFloat && bitsPerSample === 32)
                s = buf.readFloatLE(off);
            else if (bitsPerSample === 8)
                s = (buf.readUInt8(off) - 128) / 128; // 8-bit 无符号
            else if (bitsPerSample === 16)
                s = buf.readInt16LE(off) / 32768;
            else if (bitsPerSample === 24) {
                const b0 = buf[off], b1 = buf[off + 1], b2 = buf[off + 2];
                let v = (b2 << 16) | (b1 << 8) | b0;
                if (v & 0x800000)
                    v |= ~0xffffff; // 符号扩展
                s = v / 8388608;
            }
            else if (bitsPerSample === 32)
                s = buf.readInt32LE(off) / 2147483648;
            sum += s;
        }
        mono[f] = sum / numChannels;
    }
    return mono;
}
/** 用 ffmpeg 把任意音频（本地路径或 URL）解成 s16le 单声道 8kHz 裸 PCM，算 peaks。 */
function peaksViaFfmpeg(src, buckets, ff) {
    return new Promise((resolve) => {
        let child;
        try {
            child = (0, child_process_1.spawn)(ff, ['-hide_banner', '-loglevel', 'error', '-i', src, '-f', 's16le', '-ac', '1', '-ar', '8000', '-'], {
                windowsHide: true,
                stdio: ['ignore', 'pipe', 'ignore'],
            });
        }
        catch {
            resolve(null);
            return;
        }
        const chunks = [];
        let bytes = 0;
        const CAP = 64 * 1024 * 1024; // 64MB 采样上限，防病态长音频撑爆内存
        child.stdout.on('data', (c) => {
            chunks.push(c);
            bytes += c.length;
            if (bytes >= CAP) {
                try {
                    child.kill();
                }
                catch {
                    /* ignore */
                }
            }
        });
        child.on('error', () => resolve(null));
        child.on('close', () => {
            const pcm = Buffer.concat(chunks);
            const n = Math.floor(pcm.length / 2);
            if (n === 0) {
                resolve(null);
                return;
            }
            const mono = new Float64Array(n);
            for (let i = 0; i < n; i++)
                mono[i] = pcm.readInt16LE(i * 2) / 32768;
            resolve({ peaks: bucketPeaks(mono, buckets), via: 'ffmpeg' });
        });
    });
}
/**
 * 计算波形 peaks。优先纯 Node 解 WAV（无外部依赖）；非 WAV 则走 ffmpeg（不可用返回 null）。
 * @param src 本地绝对路径或 http(s) URL
 * @param buckets 竖条数量（≈波形像素宽 / 间距），默认 400
 */
async function computePeaks(src, buckets = 400) {
    if (!src)
        return null;
    const looksWav = /\.wav(\?|$)/i.test(src) || !isHttp(src);
    // WAV（或本地文件先嗅探）走纯解析，避免无谓依赖 ffmpeg
    if (looksWav) {
        try {
            let buf;
            if (isHttp(src)) {
                const res = await fetch(src);
                if (!res.ok)
                    throw new Error('fetch ' + res.status);
                buf = Buffer.from(await res.arrayBuffer());
            }
            else {
                buf = (0, fs_1.readFileSync)(src);
            }
            const mono = parseWav(buf);
            if (mono)
                return { peaks: bucketPeaks(mono, buckets), via: 'wav' };
            // 本地文件嗅探失败（非 WAV）→ 落到 ffmpeg 分支
        }
        catch {
            if (isHttp(src))
                return null; // 远程且非可解析 WAV：不强求 ffmpeg 拉 URL，直接降级
        }
    }
    const ff = resolveFfmpeg();
    if (!ff)
        return null;
    return peaksViaFfmpeg(src, buckets, ff);
}
