"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSampleVideo = ensureSampleVideo;
// 用 ffmpeg 现生成一小段带运动/色彩的样例视频（testsrc2：彩条 + 移动图形 + 帧计数），
// 存到系统临时目录并缓存路径，供 demo 离线可复现地播放（不往仓库塞二进制）。
// 依赖 resolveFfmpeg()（devDep ffmpeg-static，已实测带 libx264）；缺 ffmpeg 即 reject，上层降级。
const child_process_1 = require("child_process");
const path_1 = require("path");
const os_1 = require("os");
const fs_1 = require("fs");
const ffmpeg_1 = require("../audio/ffmpeg");
let cached = null;
function ensureSampleVideo() {
    if (cached && (0, fs_1.existsSync)(cached))
        return Promise.resolve(cached);
    const ff = (0, ffmpeg_1.resolveFfmpeg)();
    if (!ff)
        return Promise.reject(new Error('no-ffmpeg'));
    const out = (0, path_1.join)((0, os_1.tmpdir)(), 'flux-sample-testsrc2.mp4');
    if ((0, fs_1.existsSync)(out)) {
        cached = out;
        return Promise.resolve(out);
    }
    const args = [
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        '-f',
        'lavfi',
        '-i',
        'testsrc2=size=640x360:rate=30:duration=8',
        '-pix_fmt',
        'yuv420p',
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        out,
    ];
    return new Promise((resolve, reject) => {
        const p = (0, child_process_1.spawn)(ff, args, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
        let err = '';
        p.stderr.on('data', (d) => (err += d));
        p.on('error', reject);
        p.on('close', (code) => {
            if (code === 0) {
                cached = out;
                resolve(out);
            }
            else {
                reject(new Error('gen exit ' + code + ': ' + err.slice(-300)));
            }
        });
    });
}
