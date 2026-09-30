"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocFrameSlot = allocFrameSlot;
exports.setFrame = setFrame;
exports.peekFrame = peekFrame;
exports.freeFrameSlot = freeFrameSlot;
// 帧槽注册表：解码器把最新一帧（RGBA）写进各自的槽，painter 按 videoId 读取并 blit 到画布。
// 单独成模块是为了断开 io ↔ paint 的循环依赖：painter 只 import 本表，绝不 import 解码器。
// canvas 用 @napi-rs/canvas 现制，尺寸即“解码帧尺寸”（已按长边上限缩放），painter 再按 contain/cover 缩放贴合盒子。
const canvas_1 = require("@napi-rs/canvas");
const slots = new Map();
/** 为一个 videoId 建槽（解码尺寸确定后调用一次；seek 不改尺寸，无需重建） */
function allocFrameSlot(id, width, height) {
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    slots.set(id, { canvas, ctx, imgData: ctx.createImageData(width, height), width, height, ready: false });
}
/** 写入一帧 RGBA（长度须 = width*height*4）；复用 imgData，避免每帧新建 */
function setFrame(id, rgba) {
    const s = slots.get(id);
    if (!s)
        return;
    s.imgData.data.set(rgba);
    s.ctx.putImageData(s.imgData, 0, 0);
    s.ready = true;
}
/** painter 每帧读取：返回当前槽（含 canvas/dims/ready），无则 null */
function peekFrame(id) {
    return slots.get(id) ?? null;
}
function freeFrameSlot(id) {
    slots.delete(id);
}
