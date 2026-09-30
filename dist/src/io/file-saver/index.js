"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSaver = FileSaver;
// FileSaver：文件保存器（输出类 I/O 组件，FilePicker 的反向对应）。
//   点击 → 原生「另存为」对话框（PowerShell SaveFileDialog，见 ../dialog）选定目标路径 →
//   用 fs.writeFileSync 把内容写盘。内容支持 string / Buffer / Uint8Array / dataURL，
//   或返回以上者的（异步）懒函数（便于「点了再生成」的大内容）。
// 显示 保存中 / 成功（回显路径）/ 失败（回显错误）三态。仅 Windows 有原生对话框；
// 非 Win 或环境不支持时 saveFile() 返回空串，等同取消，绝不崩。
const react_1 = __importDefault(require("react"));
const fs_1 = require("fs");
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const button_1 = require("../../ui/button");
const dialog_1 = require("../dialog");
/** 归一为可写 Buffer：string→utf8；Buffer/Uint8Array 原样；dataURL 解码 */
function toBuffer(content) {
    if (Buffer.isBuffer(content))
        return content;
    if (content instanceof Uint8Array)
        return Buffer.from(content);
    const s = String(content);
    if (s.startsWith('data:')) {
        const comma = s.indexOf(',');
        const meta = s.slice(0, comma);
        const body = s.slice(comma + 1);
        if (meta.includes(';base64'))
            return Buffer.from(body, 'base64');
        return Buffer.from(decodeURIComponent(body), 'utf8');
    }
    return Buffer.from(s, 'utf8');
}
/** 字节数 → 人类可读 */
function humanSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0)
        return '';
    if (bytes < 1024)
        return bytes + ' B';
    const units = ['KB', 'MB', 'GB'];
    let n = bytes / 1024;
    let i = 0;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return n.toFixed(n >= 10 ? 0 : 1) + ' ' + units[i];
}
function FileSaver(props) {
    const { token } = (0, theme_1.useToken)();
    const { data, filename, accept, title, dialogTitle, disabled, onSaved, style } = props;
    const [status, setStatus] = react_1.default.useState('idle');
    const [msg, setMsg] = react_1.default.useState('');
    const [size, setSize] = react_1.default.useState(0);
    const save = () => {
        if (disabled)
            return;
        const path = (0, dialog_1.saveFile)({ accept, title: dialogTitle || '保存文件', defaultName: filename });
        if (!path)
            return; // 取消或环境不支持：保持原状
        setStatus('saving');
        setMsg('');
        // 延后一拍让「保存中」态有机会上屏，再求值内容并写盘（懒函数可能异步）
        setTimeout(() => {
            void (async () => {
                try {
                    const raw = typeof data === 'function' ? await data() : data;
                    const buf = toBuffer(raw);
                    (0, fs_1.writeFileSync)(path, buf);
                    setSize(buf.length);
                    setStatus('done');
                    setMsg(path);
                    onSaved && onSaved(path);
                }
                catch (e) {
                    setStatus('error');
                    setMsg(e?.message || String(e));
                }
            })();
        }, 16);
    };
    const saving = status === 'saving';
    const statusColor = status === 'done' ? token.colorSuccess : status === 'error' ? token.colorError : token.colorTextTertiary;
    return (react_1.default.createElement(components_1.View, { style: [{ width: '100%' }, style] },
        react_1.default.createElement(button_1.Button, { icon: react_1.default.createElement(icon_1.Icon, { name: saving ? 'loading' : 'save', size: token.fontSize + 2, animate: saving ? 'spin' : undefined }), onClick: save, disabled: disabled || saving, style: { alignSelf: 'flex-start' } }, saving ? '正在保存…' : title || '保存文件'),
        status === 'done' || status === 'error' ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'flex-start', marginTop: token.marginXS } },
            react_1.default.createElement(icon_1.Icon, { name: status === 'done' ? 'checkCircle' : 'closeCircle', size: token.fontSize + 2, color: statusColor }),
            react_1.default.createElement(components_1.Text, { style: {
                    marginLeft: token.marginXS,
                    flex: 1,
                    fontSize: token.fontSizeSM,
                    color: statusColor,
                }, numberOfLines: 2 }, status === 'done'
                ? `已保存（${humanSize(size)}）：${msg}`
                : `保存失败：${msg}`))) : null));
}
exports.default = FileSaver;
