"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribe = subscribe;
exports.activeCount = activeCount;
// 动画时间轴：全局一个 setInterval 驱动所有订阅者，配合 scheduleFrame 合成一帧。
// 只有存在活跃订阅时才运转，最后一个订阅者退订即停表，避免空转吃 CPU。
const scheduler_1 = require("../frame/scheduler");
const subs = new Set();
let timer = null;
/** 目标帧间隔（ms）。~60fps；CPU 光栅 + RGBA blit 足够跟上。 */
const INTERVAL = 16;
function tick() {
    if (subs.size === 0)
        return;
    const now = Date.now();
    // 复制一份再遍历，允许回调内部退订（如一次性动画播完自停）
    for (const cb of Array.from(subs)) {
        try {
            cb(now);
        }
        catch (e) {
            console.error('[flux-skia] ticker callback failed: ' + (e && e.stack ? e.stack : e));
        }
    }
    (0, scheduler_1.scheduleFrame)();
    // 回调内部全部退订（如一次性动画播完自停）时，退订闭包里的清表条件在 tick 中不生效，这里补扫尾
    if (subs.size === 0 && timer != null) {
        clearInterval(timer);
        timer = null;
    }
}
function ensureRunning() {
    if (timer == null)
        timer = setInterval(tick, INTERVAL);
}
/** 订阅每一帧；返回退订函数。 */
function subscribe(cb) {
    subs.add(cb);
    ensureRunning();
    (0, scheduler_1.scheduleFrame)();
    return () => {
        subs.delete(cb);
        if (subs.size === 0 && timer != null) {
            clearInterval(timer);
            timer = null;
        }
    };
}
/** 当前活跃订阅数（host 滚动条带缓存据此判定「有无动画在跑」：>0 则不可增量 blit，须整帧重绘） */
function activeCount() {
    return subs.size;
}
