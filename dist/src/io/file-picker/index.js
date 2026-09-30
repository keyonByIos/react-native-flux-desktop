"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePicker = FilePicker;
// FilePicker：文件选择器（输入类 I/O 组件）。两条录入路径：
//   1) 点击 → 原生系统文件对话框（PowerShell OpenFileDialog，见 ../dialog）
//   2) 拖拽 → 从资源管理器把文件拖进窗口（OS 级 drop，经 host → events/drop 总线路由到本组件）
// 选中项以列表呈现，可逐项移除。受控（value+onChange）/ 非受控（defaultFiles）双模式。
//
// 说明：winit 的 DroppedFile 不带光标坐标，故多目标路由取「最后 hover 的激活目标」（见 drop.ts）。
const react_1 = __importDefault(require("react"));
const fs_1 = require("fs");
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const button_1 = require("../../ui/button");
const dialog_1 = require("../dialog");
const drop_1 = require("../../events/drop");
/** 取文件名（basename，兼容 \ 与 /） */
function baseName(p) {
    const parts = p.split(/[\\/]/);
    return parts[parts.length - 1] || p;
}
/** 扩展名（小写，含点），无则空串 */
function extOf(p) {
    const b = baseName(p);
    const i = b.lastIndexOf('.');
    return i > 0 ? b.slice(i).toLowerCase() : '';
}
/** 按 accept 过滤（accept 为空 = 全通过） */
function filterAccept(paths, accept) {
    if (!accept || !accept.length)
        return paths;
    const set = accept.map((e) => (e.startsWith('.') ? e.toLowerCase() : '.' + e.toLowerCase()));
    return paths.filter((p) => set.includes(extOf(p)));
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
function fileSize(p) {
    try {
        return humanSize((0, fs_1.statSync)(p).size);
    }
    catch {
        return '';
    }
}
function FilePicker(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultFiles, multiple = false, accept, variant = 'drag', disabled, title, hint, dialogTitle, onChange, style, } = props;
    const [inner, setInner] = react_1.default.useState(defaultFiles || []);
    const files = value !== undefined ? value : inner;
    const [dragOver, setDragOver] = react_1.default.useState(false);
    const zoneId = react_1.default.useRef(-1);
    // 用 ref 承接最新逻辑，供 drop 总线的一次性注册回调读取（避免闭包过期）
    const api = react_1.default.useRef({ add: () => { } });
    api.current.add = (paths) => {
        const picked = filterAccept(paths, accept);
        if (!picked.length)
            return;
        const next = multiple
            ? Array.from(new Set([...files, ...picked]))
            : [picked[picked.length - 1]];
        if (value === undefined)
            setInner(next);
        onChange && onChange(next);
    };
    react_1.default.useEffect(() => {
        zoneId.current = (0, drop_1.registerDropZone)({
            onEnter: () => !disabled && setDragOver(true),
            onLeave: () => setDragOver(false),
            onDrop: (paths) => {
                setDragOver(false);
                if (!disabled)
                    api.current.add(paths);
            },
        });
        return () => {
            if (zoneId.current >= 0)
                (0, drop_1.unregisterDropZone)(zoneId.current);
            zoneId.current = -1;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled]);
    const browse = () => {
        if (disabled)
            return;
        const picked = (0, dialog_1.pickFiles)({ multiple, accept, title: dialogTitle || title || '选择文件' });
        if (picked.length)
            api.current.add(picked);
    };
    const removeAt = (idx) => {
        if (disabled)
            return;
        const next = files.slice(0, idx).concat(files.slice(idx + 1));
        if (value === undefined)
            setInner(next);
        onChange && onChange(next);
    };
    const radius = token.borderRadiusLG;
    const borderColor = dragOver ? token.colorPrimary : token.colorBorder;
    const zoneBg = dragOver ? token.colorPrimaryBg : token.colorFillQuaternary;
    const accent = dragOver ? token.colorPrimary : token.colorTextSecondary;
    const dragZone = {
        minHeight: 132,
        padding: token.paddingLG,
        borderRadius: radius,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor,
        backgroundColor: zoneBg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
    };
    return (react_1.default.createElement(components_1.View, { style: [{ width: '100%' }, style] },
        variant === 'button' ? (react_1.default.createElement(button_1.Button, { icon: react_1.default.createElement(icon_1.Icon, { name: "folder", size: token.fontSize + 2 }), onClick: browse, disabled: disabled, style: { alignSelf: 'flex-start' } }, title || '选择文件')) : (react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: browse, onMouseEnter: () => zoneId.current >= 0 && (0, drop_1.activateDropZone)(zoneId.current), style: dragZone },
            react_1.default.createElement(components_1.View, { style: { alignItems: 'center' } },
                react_1.default.createElement(icon_1.Icon, { name: "upload", size: 34, color: accent, strokeWidth: 1.6 }),
                react_1.default.createElement(components_1.Text, { style: { marginTop: token.marginSM, fontSize: token.fontSize, color: token.colorText } }, title || '点击选择文件'),
                react_1.default.createElement(components_1.Text, { style: { marginTop: 4, fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, hint || '或将文件拖拽到此处')))),
        files.length > 0 ? (react_1.default.createElement(components_1.View, { style: { marginTop: token.marginSM } }, files.map((f, i) => (react_1.default.createElement(components_1.View, { key: f + i, style: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 6,
                paddingHorizontal: token.paddingXS,
                borderRadius: token.borderRadius,
                backgroundColor: dragOver ? 'transparent' : token.colorFillTertiary,
            } },
            react_1.default.createElement(icon_1.Icon, { name: "file", size: token.fontSize + 2, color: token.colorTextSecondary }),
            react_1.default.createElement(components_1.Text, { style: { marginLeft: token.marginXS, flex: 1, fontSize: token.fontSize, color: token.colorText }, numberOfLines: 1 }, baseName(f)),
            react_1.default.createElement(components_1.Text, { style: { marginRight: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, fileSize(f)),
            react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: () => removeAt(i) },
                react_1.default.createElement(icon_1.Icon, { name: "closeCircle", size: token.fontSize + 2, color: token.colorTextQuaternary }))))))) : null));
}
exports.default = FilePicker;
