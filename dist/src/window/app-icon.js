"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachWindowIcon = attachWindowIcon;
exports.ensureAppUserModelId = ensureAppUserModelId;
// app-icon.ts —— 运行期给窗口设图标（标题栏 + 任务栏按钮）。
// 背景：打包后真正拥有窗口、出现在任务栏的进程是 node.exe；Windows 任务栏默认取「进程主 exe 图标」
//   = node 的绿色六边形。exe 自身内嵌图标只影响文件资源管理器，改不了任务栏。唯一修法是对窗口 WM_SETICON，
//   即 native setWindowIcon(id, rgba, w, h)。native 只吃 RGBA8，故这里用 @napi-rs/canvas 把
//   process.env.FLUX_ICON 指的 PNG 解码并缩放成 64×64 RGBA，缓存后应用到每个窗口（含后续新建的）。
// 契约：消费方在建窗前设 process.env.FLUX_ICON = <图标 PNG 绝对路径>；未设或解码失败即静默跳过（不影响运行）。
// 另：任务栏按钮按进程 AUMID 归组，默认落到 node.exe → 显示 node 图标，WM_SETICON 改不动归组图标。
//   故建窗前还需 native setAppUserModelId(process.env.FLUX_APP_ID) 给进程一个独立 AUMID，图标才会被按钮采用。
//@ts-ignore
const lab = require('../../../index.js');
let cached = null;
let loading = false;
/** 已建但图标尚未解码完成的窗口 id：解码好后可补贴 */
const pending = new Set();
function applyTo(id) {
    if (!cached)
        return;
    try {
        lab.setWindowIcon(id, cached.buf, cached.w, cached.h);
    }
    catch {
        /* native 未就绪 / 窗口已关：忽略，不影响运行 */
    }
}
function load() {
    if (loading || cached)
        return;
    const p = process.env.FLUX_ICON;
    if (!p)
        return;
    loading = true;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const canvas = require('@napi-rs/canvas');
        Promise.resolve(canvas.loadImage(p))
            .then((img) => {
            const S = 64;
            const c = canvas.createCanvas(S, S);
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, S, S);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, S, S);
            const data = ctx.getImageData(0, 0, S, S).data; // RGBA, 长度 = S*S*4
            cached = { buf: Buffer.from(data.buffer, data.byteOffset, data.byteLength), w: S, h: S };
            pending.forEach(applyTo);
            pending.clear();
        })
            .catch(() => {
            /* 解码失败（文件缺失/格式不支持）：保持无图标 */
        });
    }
    catch {
        /* canvas 不可用：忽略 */
    }
}
/** 建窗后调用：把图标贴到该窗。已解码则立即应用，否则登记待解码完成后补贴。 */
function attachWindowIcon(id) {
    if (!process.env.FLUX_ICON)
        return;
    if (cached) {
        applyTo(id);
        return;
    }
    pending.add(id);
    load();
}
let aumidDone = false;
/** 建窗前调用一次：给当前进程设独立 AUMID，使任务栏按钮采用我们给窗口设的图标（而非 node.exe 的）。
 *  读 process.env.FLUX_APP_ID；未设或 native 不可用即静默跳过。幂等，只生效一次。 */
function ensureAppUserModelId() {
    if (aumidDone)
        return;
    aumidDone = true;
    const id = process.env.FLUX_APP_ID;
    if (!id)
        return;
    try {
        lab.setAppUserModelId(id);
    }
    catch {
        /* native 未就绪 / 非 Windows：忽略，不影响运行 */
    }
}
