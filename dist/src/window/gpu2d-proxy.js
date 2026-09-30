"use strict";
// Gpu2DProxy：将 @napi-rs/canvas 的 CanvasRenderingContext2D 接口映射到 Rust GpuCtx2D。
// 目的：paintTree 无需改动——它只管调 ctx.fillRect/fillText/drawImage 等方法，
// 本 Proxy 把方法调用转发进 GPU surface；图片加载后自动转为 GpuImage。
//
// 与 CPU 路径的差异：
// - 无 faces 双面乒乓 / scroll blit（GPU 直写帧缓冲，无需像素搬运）
// - 无 canvas.data() 读回（flush = swap_buffers 上屏）
// - drawImage 自动提取 RGBA → GpuImage → 按 id 调 GPU 绘制
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gpu2DProxy = void 0;
exports.gpuAvailable = gpuAvailable;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lab = require('../../../index.js');
const { GpuCtx2D, GpuImage, releaseGpuImage } = lab;
/** 已转换的 canvas-img → GpuImage 映射（弱键避免泄漏） */
const imgGpuMap = new WeakMap();
// 【临时诊断】GpuImage 实际新建次数（WeakMap miss）+ GPU 帧号，定位滞动内存来源。
let gpuImgCreates = 0;
let gpuFrames = 0;
const FinalizationRegistryCtor = globalThis.FinalizationRegistry;
const gpuImgRegistry = new FinalizationRegistryCtor((id) => {
    try {
        releaseGpuImage(id);
    }
    catch {
        /* addon 已卸载：忽略 */
    }
});
function ensureGpuImage(img) {
    if (!img || !img.width || !img.height)
        return null;
    const existing = imgGpuMap.get(img);
    if (existing)
        return existing;
    // 从 @napi-rs/canvas 的 Image 对象提取 RGBA 像素
    const w = img.width;
    const h = img.height;
    // 从 @napi-rs/canvas 图像对象提取原始 RGBA。⚠️ 不能用 toBuffer('raw')：
    // Canvas/Image 的 toBuffer 只收图片 mime（'image/png' 等），传 'raw' 抛「raw is not valid mime」
    // → paintTree 内抛出 → host 捕获 → 整窗静默降级 CPU（GPU 形同未启用，此前首页有图即触发）。
    // 正确口径与 CPU present 一致：Canvas.data() 返回原始 RGBA（Skia 默认 N32 premul）。
    let rgba;
    if (typeof img.data === 'function') {
        // Canvas（降采样位图 / 视频帧 / 烘图 / 合成 key）：直接取原始像素
        rgba = img.data();
    }
    else {
        // Image（loadImage 返回，无 data()）：画到同尺寸临时 canvas 再取像素
        const { createCanvas } = require('@napi-rs/canvas');
        const c = createCanvas(w, h);
        c.getContext('2d').drawImage(img, 0, 0);
        rgba = c.data();
    }
    const gpu = new GpuImage(w, h, rgba);
    gpuImgCreates++;
    imgGpuMap.set(img, gpu);
    gpuImgRegistry.register(img, gpu.id);
    return gpu;
}
/**
 * Gpu2DProxy：与 CanvasRenderingContext2D 接口对齐，内部转发 GpuCtx2D。
 * 用法：const ctx = new Gpu2DProxy(winId); paintTree(ctx, root, dpr); ctx.flush();
 */
class Gpu2DProxy {
    constructor(winId) {
        /** painter 据此判断走 GPU 分支（图标层直传 SVG path data 字符串，不建 Path2D）。 */
        this.__gpu = true;
        this._dpr = 1;
        this._fontStr = '10px sans-serif';
        this._baseline = 'alphabetic';
        this._gpu = new GpuCtx2D(winId);
    }
    // ---- 属性 setter 代理 ----
    set fillStyle(v) { this._gpu.fillStyle = v; }
    get fillStyle() { return ''; }
    set strokeStyle(v) { this._gpu.strokeStyle = v; }
    get strokeStyle() { return ''; }
    set lineWidth(v) { this._gpu.lineWidth = v; }
    get lineWidth() { return 1; }
    set globalAlpha(v) { this._gpu.globalAlpha = v; }
    get globalAlpha() { return 1; }
    set lineCap(v) { this._gpu.lineCap = v; }
    get lineCap() { return 'butt'; }
    set lineJoin(v) { this._gpu.lineJoin = v; }
    get lineJoin() { return 'miter'; }
    set font(v) {
        this._fontStr = v;
        this._gpu.font = v;
    }
    get font() { return this._fontStr; }
    set textBaseline(v) {
        this._baseline = v;
        this._gpu.setTextBaseline(v);
    }
    get textBaseline() { return this._baseline; }
    set textAlign(_v) { }
    get textAlign() { return 'left'; }
    // ---- 方法 ----
    setLineDash(segments) { this._gpu.setLineDash(segments); }
    save() { this._gpu.save(); }
    restore() { this._gpu.restore(); }
    translate(x, y) { this._gpu.translate(x, y); }
    scale(sx, sy) { this._gpu.scale(sx, sy); }
    rotate(angle) { this._gpu.rotate(angle); }
    setTransform(a, b, c, d, e, f) {
        this._gpu.setTransform(a, b, c, d, e, f);
    }
    transform(a, b, c, d, e, f) {
        this._gpu.transform(a, b, c, d, e, f);
    }
    resetTransform() { this._gpu.resetTransform(); }
    fillRect(x, y, w, h) { this._gpu.fillRect(x, y, w, h); }
    strokeRect(x, y, w, h) { this._gpu.strokeRect(x, y, w, h); }
    clearRect(x, y, w, h) { this._gpu.clearRect(x, y, w, h); }
    beginPath() { this._gpu.beginPath(); }
    moveTo(x, y) { this._gpu.moveTo(x, y); }
    lineTo(x, y) { this._gpu.lineTo(x, y); }
    arcTo(x1, y1, x2, y2, r) {
        this._gpu.arcTo(x1, y1, x2, y2, r);
    }
    arc(x, y, r, start, end, ccw) {
        this._gpu.arc(x, y, r, start, end, ccw ?? false);
    }
    quadraticCurveTo(cx, cy, x, y) {
        this._gpu.quadraticCurveTo(cx, cy, x, y);
    }
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
        this._gpu.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    }
    closePath() { this._gpu.closePath(); }
    fill(path, rule) {
        // Canvas2D 重载：fill(path[, rule])。GPU 模式 path 只可能是字符串（painter 按 __gpu 传 d）；
        // 无参时用当前默认路径。
        if (typeof path === 'string')
            this._gpu.fillSvgPath(path, rule === 'evenodd');
        else
            this._gpu.fill();
    }
    stroke(path) {
        if (typeof path === 'string')
            this._gpu.strokeSvgPath(path);
        else
            this._gpu.stroke();
    }
    clip() { this._gpu.clip(); }
    fillText(text, x, y) { this._gpu.fillText(text, x, y); }
    strokeText(text, x, y) { this._gpu.strokeText(text, x, y); }
    measureText(text) {
        return { width: this._gpu.measureText(text) };
    }
    /** drawImage 兼容 Canvas2D 签名：接受 @napi-rs/canvas Image/Canvas 对象。 */
    drawImage(img, dx, dy, dw, dh) {
        const gpu = ensureGpuImage(img);
        if (!gpu)
            return;
        if (dw !== undefined && dh !== undefined) {
            this._gpu.drawImage(gpu.id, dx, dy, dw, dh);
        }
        else {
            this._gpu.drawImage(gpu.id, dx, dy);
        }
    }
    // ---- 呈现 ----
    /** GPU flush：提交绘制命令 + swap_buffers 直呈。 */
    flush() {
        this._gpu.flush();
        // 【临时诊断】FLUX_GPU_DIAG=1 时每 30 帧打印内存分项（不能每帧：process.memoryUsage()+写盘本身就是巨大开销）。
        if (process.env.FLUX_GPU_DIAG) {
            gpuFrames++;
            if (gpuFrames % 30 === 0) {
                const m = process.memoryUsage();
                const mb = (n) => (n / 1048576).toFixed(1);
                const cb = typeof this._gpu.cacheBytes === 'function' ? this._gpu.cacheBytes() : 0;
                console.error(`[gpudiag] f=${gpuFrames} rss=${mb(m.rss)} heap=${mb(m.heapUsed)} ext=${mb(m.external)} ab=${mb(m.arrayBuffers || 0)} gpuImgNew=${gpuImgCreates} gpuCache=${mb(cb)}`);
            }
        }
    }
    /** 清屏（背景色 RGBA 0-255）。 */
    clearAll(r, g, b, a) {
        this._gpu.clearAll(r, g, b, a);
    }
    /** 设置 dpr 缩放（paintTree 入口通常用 setTransform(dpr,0,0,dpr,0,0)）。 */
    setDpr(dpr) {
        this._dpr = dpr;
    }
}
exports.Gpu2DProxy = Gpu2DProxy;
/** 检测 GPU 模式是否可用 */
function gpuAvailable() {
    return process.env.FLUX_GPU === '1' && typeof GpuCtx2D !== 'undefined';
}
// ─── 诊断：FLUX_GPU_TRACE=<file> 时记录 GPU 收到的完整 op 序列（定位转发层渲染 bug 用）───
if (process.env.FLUX_GPU_TRACE) {
    const fs = require('fs');
    const file = process.env.FLUX_GPU_TRACE;
    let seq = 0;
    const log = (name, args) => {
        try {
            fs.appendFileSync(file, `${seq++} ${name}(${args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(',')})\n`);
        }
        catch { /* 诊断失败不影响渲染 */ }
    };
    const proto = Gpu2DProxy.prototype;
    for (const key of Object.getOwnPropertyNames(proto)) {
        if (key === 'constructor')
            continue;
        const d = Object.getOwnPropertyDescriptor(proto, key);
        if (typeof d.value === 'function') {
            const orig = d.value;
            // eslint-disable-next-line func-style
            const wrapped = function (...args) { log(key, args); return orig.apply(this, args); };
            Object.defineProperty(proto, key, { ...d, value: wrapped });
        }
        else {
            if (d.set) {
                const origSet = d.set;
                Object.defineProperty(proto, key, { ...d, set(v) { log(`set:${key}`, [v]); origSet.call(this, v); } });
            }
        }
    }
}
