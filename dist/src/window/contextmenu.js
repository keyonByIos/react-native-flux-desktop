"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showContextMenu = showContextMenu;
exports.hideContextMenu = hideContextMenu;
exports.getContextMenuState = getContextMenuState;
exports.subscribeContextMenu = subscribeContextMenu;
let state = { visible: false, x: 0, y: 0, items: [] };
const listeners = new Set();
function notify() {
    for (const l of listeners)
        l();
}
/** 在窗口逻辑坐标 (x,y) 弹出菜单 */
function showContextMenu(x, y, items) {
    state = { visible: true, x, y, items };
    notify();
}
/** 关闭菜单 */
function hideContextMenu() {
    if (!state.visible)
        return;
    state = { ...state, visible: false, items: [] };
    notify();
}
function getContextMenuState() {
    return state;
}
function subscribeContextMenu(l) {
    listeners.add(l);
    return () => {
        listeners.delete(l);
    };
}
