"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameDecoder = void 0;
exports.probe = probe;
// 视频解码引擎：用 ffmpeg 把视频解成 rawvideo RGBA 帧流，按源 fps 节奏逐帧写进帧槽（./registry），
// 每帧调 scheduleFrame() 触发一次自绘重绘。纯 ffmpeg、跨平台；v1 明确只出画面、丢音轨（-an）。
//
// 设计要点：
// - 探测无 ffprobe（ffmpeg-static 不带），故跑 `ffmpeg -i src` 从 stderr 正则解析 Duration/WxH/fps。
// - 长边按 maxEdge（默认 640）缩放，界定每帧字节与 CPU；实测 640x360 blit 仅 ~0.8ms/帧，30fps 绰绰有余。
// - 解码吞吐远大于实时（实测 ~470fps），靠 stdout.pause()/resume() 做背压，队列封顶不爆内存。
// - 原始 rawvideo 无时间戳：播放位置 = startSec + 已上屏帧数 / fps；seek 用输入侧 -ss（快速、跳关键帧）重生管道。
// - 缺 ffmpeg（生产 --omit=dev）→ probe 直接抛错，上层显示降级提示，绝不崩。
const child_process_1 = require("child_process");
const ffmpeg_1 = require("../audio/ffmpeg");
const registry_1 = require("./registry");
const scheduler_1 = require("../../frame/scheduler");
const DEFAULT_MAX_EDGE = 640;
const QUEUE_HIGH = 12;
const QUEUE_LOW = 4;
/** 探测媒体元信息（时长/尺寸/帧率）。ffmpeg 不可用或解析失败即 reject。 */
function probe(src) {
    return new Promise((resolve, reject) => {
        const ff = (0, ffmpeg_1.resolveFfmpeg)();
        if (!ff)
            return reject(new Error('no-ffmpeg'));
        // 无输出时 ffmpeg 打印信息到 stderr 并以非 0 退出，属正常，忽略 err 只解析文本
        (0, child_process_1.execFile)(ff, ['-hide_banner', '-i', src], { windowsHide: true, timeout: 15000, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
            void err;
            const meta = parseMeta(String(stderr || '') + String(stdout || ''));
            if (meta)
                resolve(meta);
            else
                reject(new Error('parse-failed'));
        });
    });
}
function parseMeta(text) {
    let duration = 0;
    const d = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (d)
        duration = Number(d[1]) * 3600 + Number(d[2]) * 60 + parseFloat(d[3]);
    // 取视频流里的 WxH（约束 2~5 位数字，避开 "0x31637661" 这类单位十六进制误配）
    const size = text.match(/\b(\d{2,5})x(\d{2,5})\b/);
    if (!size)
        return null;
    const width = parseInt(size[1], 10);
    const height = parseInt(size[2], 10);
    if (!(width > 0 && height > 0))
        return null;
    const fm = text.match(/(\d+(?:\.\d+)?)\s*fps/);
    let fps = fm ? parseFloat(fm[1]) : 30;
    if (!Number.isFinite(fps) || fps <= 0 || fps > 240)
        fps = 30;
    if (!Number.isFinite(duration) || duration < 0)
        duration = 0;
    return { duration, width, height, fps };
}
/** 单实例解码器：常驻一条 ffmpeg 解码管道 + 一个 fps 定时器。 */
class FrameDecoder {
    constructor(opts, meta) {
        this.opts = opts;
        this.meta = meta;
        this.child = null;
        this.timer = null;
        this.queue = [];
        this.pending = Buffer.alloc(0);
        this.streamPaused = false;
        this.killing = false;
        this.childClosed = false;
        this.playing = false;
        this.startSec = 0;
        this.consumed = 0;
        this.prime = false;
        this.onState = null;
        this.onEnd = null;
        this.step = () => {
            if (!this.playing)
                return;
            if (this.queue.length) {
                this.takeOne();
                return;
            }
            if (this.finished()) {
                this.playing = false;
                this.clearTimer();
                this.emit();
                if (this.onEnd)
                    this.onEnd();
            }
            // 队列空但未结束＝饥饿：保持上一帧，等 ffmpeg 补上
        };
        this.ff = (0, ffmpeg_1.resolveFfmpeg)();
        const cap = opts.maxEdge ?? DEFAULT_MAX_EDGE;
        const k = Math.min(1, cap / Math.max(meta.width, meta.height));
        this.dw = Math.max(2, Math.round((meta.width * k) / 2) * 2);
        this.dh = Math.max(2, Math.round((meta.height * k) / 2) * 2);
        this.frameBytes = this.dw * this.dh * 4;
        (0, registry_1.allocFrameSlot)(opts.id, this.dw, this.dh);
    }
    get duration() {
        return this.meta.duration;
    }
    get aspect() {
        return this.meta.width / this.meta.height;
    }
    /** 起流；autoplay=true 时同时开始按帧率上屏 */
    start(autoplay = false) {
        this.spawnStream(this.startSec);
        if (autoplay)
            this.play();
    }
    play() {
        if (this.playing)
            return;
        if (this.finished()) {
            // 播完后再播＝从头
            this.seek(0);
        }
        this.playing = true;
        this.ensureTimer();
        this.resumeStream();
        this.emit();
    }
    pause() {
        if (!this.playing)
            return;
        this.playing = false;
        this.clearTimer();
        this.pauseStream();
        this.emit();
    }
    /** 跳转到秒（重生解码管道，输入侧 -ss 快速 seek） */
    seek(sec) {
        const t = Math.max(0, sec);
        this.consumed = 0;
        this.startSec = t;
        this.spawnStream(t);
        this.prime = !this.playing; // 暂停态下 seek：解到首帧即上屏一次，让画面跟着跳
        this.emit();
    }
    dispose() {
        this.clearTimer();
        this.killChild();
        (0, registry_1.freeFrameSlot)(this.opts.id);
        this.onState = null;
        this.onEnd = null;
    }
    // ---- 内部 ----
    finished() {
        return this.childClosed && this.queue.length === 0 && this.pending.length < this.frameBytes;
    }
    spawnStream(fromSec) {
        this.killChild();
        this.queue = [];
        this.pending = Buffer.alloc(0);
        this.streamPaused = false;
        this.childClosed = false;
        if (!this.ff)
            return;
        const args = ['-hide_banner', '-loglevel', 'error'];
        if (fromSec > 0.001)
            args.push('-ss', fromSec.toFixed(3));
        args.push('-i', this.opts.src, '-an', '-vsync', '0', '-vf', `scale=${this.dw}:${this.dh}`, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-');
        const child = (0, child_process_1.spawn)(this.ff, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
        child.stdout.on('data', (c) => this.onBytes(c));
        child.stderr.on('data', () => {
            /* 丢弃告警，避免缓冲区占满阻塞 */
        });
        child.on('error', () => {
            this.childClosed = true;
        });
        child.on('close', () => {
            this.childClosed = true;
        });
        this.child = child;
    }
    onBytes(chunk) {
        this.pending = this.pending.length ? Buffer.concat([this.pending, chunk]) : chunk;
        while (this.pending.length >= this.frameBytes) {
            this.queue.push(this.pending.subarray(0, this.frameBytes));
            this.pending = this.pending.subarray(this.frameBytes);
            if (this.queue.length > QUEUE_HIGH)
                this.pauseStream();
        }
        if (this.prime && !this.playing && this.queue.length)
            this.takeOne();
    }
    takeOne() {
        const frame = this.queue.shift();
        if (!frame)
            return;
        (0, registry_1.setFrame)(this.opts.id, frame);
        this.consumed++;
        this.prime = false;
        if (this.streamPaused && this.queue.length <= QUEUE_LOW)
            this.resumeStream();
        (0, scheduler_1.scheduleFrame)();
        this.emit();
    }
    ensureTimer() {
        if (this.timer)
            return;
        const ms = Math.max(8, Math.round(1000 / this.meta.fps));
        this.timer = setInterval(this.step, ms);
    }
    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    pauseStream() {
        if (this.child && this.child.stdout && !this.streamPaused) {
            this.child.stdout.pause();
            this.streamPaused = true;
        }
    }
    resumeStream() {
        if (this.child && this.child.stdout && this.streamPaused) {
            this.child.stdout.resume();
            this.streamPaused = false;
        }
    }
    killChild() {
        if (!this.child)
            return;
        this.killing = true;
        const c = this.child;
        this.child = null;
        try {
            c.kill('SIGKILL');
        }
        catch {
            /* 已退出 */
        }
        this.killing = false;
    }
    emit() {
        if (!this.onState)
            return;
        const position = Math.min(this.meta.duration || Infinity, this.startSec + this.consumed / this.meta.fps);
        this.onState({ position: position === Infinity ? this.startSec : position, duration: this.meta.duration, playing: this.playing });
    }
}
exports.FrameDecoder = FrameDecoder;
