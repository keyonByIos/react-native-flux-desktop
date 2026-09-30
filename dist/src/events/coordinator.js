"use strict";
// 浮层协调器：解决「无 portal 架构下，点击空白处关闭 + 同屏最多一个浮层」。
// 原理：宿主在每次点击时把窗口绝对坐标 (x,y) 广播给 handleGlobalPress；
// 每个打开的浮层用 registerOverlay 登记自己的绝对矩形集合（触发器 + 面板），
// 若某浮层的所有矩形都不包含该点 → 判定为点在空白处 → 关闭它。
// 因为打开新浮层前会先广播，旧浮层（矩形不含新触发器点）自然被关闭 → 天然互斥。
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOverlay = registerOverlay;
exports.handleGlobalPress = handleGlobalPress;
exports.closeAllOverlays = closeAllOverlays;
const entries = new Set();
/** 登记一个打开的浮层；返回注销函数。rects 数组可被调用方原地更新（引用不变即可）。 */
function registerOverlay(entry) {
    entries.add(entry);
    return () => {
        entries.delete(entry);
    };
}
function contains(r, x, y) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}
/**
 * 宿主在每次「抬起即点击」时广播窗口绝对坐标。
 * 关闭所有矩形都不包含该点的浮层（即点击落在其外部）。
 * 先快照再遍历，允许 close() 内部注销自己。
 */
function handleGlobalPress(x, y) {
    if (entries.size === 0)
        return;
    for (const entry of Array.from(entries)) {
        const inside = entry.rects.some((r) => r && contains(r, x, y));
        if (!inside)
            entry.close();
    }
}
/** 主动关闭全部浮层（如切换页面/主题时用）。 */
function closeAllOverlays() {
    for (const entry of Array.from(entries))
        entry.close();
}
