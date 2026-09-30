"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readClipboard = readClipboard;
exports.writeClipboard = writeClipboard;
// 剪贴板门面：把 napi addon 的 clipboard_text / set_clipboard_text 包成同步 TS 接口。
// 编译到 dist/src/window/clipboard.js，运行时 addon 在仓库根，故 require 路径与 winit-window 一致。
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const lab = require('../../../index.js');
/** 读系统剪贴板文本；无内容/不支持返回空串 */
function readClipboard() {
    try {
        return typeof lab.clipboardText === 'function' ? lab.clipboardText() || '' : '';
    }
    catch (e) {
        return '';
    }
}
/** 写系统剪贴板文本；返回是否成功 */
function writeClipboard(text) {
    try {
        return typeof lab.setClipboardText === 'function' ? !!lab.setClipboardText(text) : false;
    }
    catch (e) {
        return false;
    }
}
