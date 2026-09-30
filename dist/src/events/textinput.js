"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findEditable = findEditable;
exports.activeEditable = activeEditable;
exports.activeController = activeController;
exports.setActiveEditable = setActiveEditable;
exports.forgetEditable = forgetEditable;
let active = null;
/** 从命中节点向上找最近持有编辑控制器的可编辑节点 */
function findEditable(node) {
    let cur = node;
    while (cur) {
        if (cur.__input)
            return cur;
        cur = cur.parent;
    }
    return null;
}
function activeEditable() {
    return active;
}
/** 当前聚焦字段的控制器；无焦点则 null。host 的 key/ime 处理据此分发。 */
function activeController() {
    return active && active.__input ? active.__input : null;
}
/**
 * 切换聚焦字段：先让旧字段 blur（提交其组合、清光标），再让新字段 focus。
 * 传入 null 表示点击空白/其它区域 → 取消焦点。同一字段重复设置不动作。
 */
function setActiveEditable(n) {
    if (active === n)
        return;
    const old = active;
    active = n;
    if (old && old.__input && old !== n)
        old.__input.blur();
    if (n && n.__input)
        n.__input.focus();
}
/** 字段卸载时调用：若它正聚焦则清除 active，避免悬垂引用导致后续事件打到已销毁控制器 */
function forgetEditable(n) {
    if (active === n)
        active = null;
}
