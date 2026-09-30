"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = Upload;
// UPLOAD：文件上传拖拽区。可视化虚线框 + 点击选文件 + 拖拽入区 + 文件列表回显（名称/大小/移除）。
// 与 FilePicker（按钮触发系统对话框）互补：Upload 是面向表单场景的拖拽区域组件。
// 本栈无真实 HTTP 上传管线，故 v1 聚焦「选文件 → 回显列表 → 移除」交互，onSelect 提供原始路径。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
function formatSize(bytes) {
    if (bytes === undefined)
        return '';
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
let _uid = 0;
const nextUid = () => `upload-${++_uid}-${Date.now()}`;
function Upload(props) {
    const { token } = (0, theme_1.useToken)();
    const { fileList: ctrlList, defaultFileList = [], onChange, maxCount, accept, disabled, hint, showList = true, style, } = props;
    const [innerList, setInnerList] = react_1.default.useState(defaultFileList);
    const list = ctrlList !== undefined ? ctrlList : innerList;
    const [dragOver, setDragOver] = react_1.default.useState(false);
    const setList = (next) => {
        if (ctrlList === undefined)
            setInnerList(next);
    };
    const emit = (next, file) => {
        setList(next);
        onChange && onChange({ fileList: next, file });
    };
    const addFiles = (names) => {
        if (disabled)
            return;
        const filtered = accept && accept.length > 0
            ? names.filter((f) => accept.some((ext) => f.name.toLowerCase().endsWith(ext.toLowerCase())))
            : names;
        const newFiles = filtered.map((f) => ({ uid: nextUid(), name: f.name, size: f.size, path: f.path }));
        let next = [...list, ...newFiles];
        if (maxCount && next.length > maxCount)
            next = next.slice(0, maxCount);
        emit(next, newFiles[0]);
    };
    const removeFile = (uid) => {
        if (disabled)
            return;
        emit(list.filter((f) => f.uid !== uid));
    };
    // 点击触发（模拟：本栈无原生文件选择器直接调用，用空操作占位；真实场景接 FilePicker）
    const handleClick = () => {
        if (disabled)
            return;
        // 实际集成时这里调 filePicker，v1 demo 里用按钮模拟添加
    };
    const acceptHint = accept && accept.length > 0 ? `支持 ${accept.join(', ')}` : '';
    return (react_1.default.createElement(components_1.View, { style: style },
        react_1.default.createElement(components_1.Pressable, { onPress: handleClick, style: {
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: dragOver ? token.colorPrimary : disabled ? token.colorTextQuaternary : token.colorBorder,
                borderRadius: token.borderRadiusLG,
                paddingVertical: token.paddingLG,
                paddingHorizontal: token.padding,
                alignItems: 'center',
                justifyContent: 'center',
                gap: token.marginXS,
                backgroundColor: dragOver ? token.colorPrimaryBg + '22' : disabled ? token.colorFillQuaternary : 'transparent',
                cursor: disabled ? 'default' : 'pointer',
            } },
            react_1.default.createElement(icon_1.Icon, { name: "upload", size: token.fontSizeXL + 4, color: disabled ? token.colorTextQuaternary : token.colorPrimary, strokeWidth: 1.5 }),
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextSecondary } }, hint || '点击或拖拽文件到此区域'),
            acceptHint ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextQuaternary } }, acceptHint)) : null),
        showList && list.length > 0 ? (react_1.default.createElement(components_1.View, { style: { marginTop: token.marginXS, gap: token.marginXXS } }, list.map((f) => (react_1.default.createElement(components_1.View, { key: f.uid, style: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: token.paddingXXS,
                paddingHorizontal: token.paddingXS,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorFillQuaternary,
            } },
            react_1.default.createElement(icon_1.Icon, { name: "file", size: token.fontSize, color: token.colorTextSecondary }),
            react_1.default.createElement(components_1.Text, { style: { flex: 1, marginLeft: token.marginXS, fontSize: token.fontSizeSM, color: token.colorText }, numberOfLines: 1 }, f.name),
            f.size !== undefined ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextQuaternary, marginRight: token.marginXS } }, formatSize(f.size))) : null,
            !disabled ? (react_1.default.createElement(components_1.Pressable, { onPress: () => removeFile(f.uid), style: { padding: 2, cursor: 'pointer' } },
                react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSizeSM, color: token.colorTextTertiary }))) : null))))) : null));
}
exports.default = Upload;
