"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartExportButton = ChartExportButton;
// ChartExportButton：把任意场景节点（典型为图表容器）当前帧裁剪成 PNG 并「另存为」写盘。
// 组合复用 FileSaver（原生保存对话框 + 三态回显），data 用懒函数：点击时才快照，避免提前生成。
// 快照链路：ref → SceneNode.id → host.findNode → snapshotNode（从最近一帧画布按 ax/ay×dpr 裁剪）。
const react_1 = __importDefault(require("react"));
const file_saver_1 = require("../../io/file-saver");
const reconciler_1 = require("../../reconciler");
function ChartExportButton(props) {
    const { target, filename = 'chart.png', title = '导出 PNG', disabled, onSaved, style } = props;
    const snap = async () => {
        const host = (0, reconciler_1.getActiveHost)();
        const node = target.current;
        if (!host || !node)
            throw new Error('当前环境不支持快照（未找到窗口宿主或节点未挂载）');
        const scene = host.findNode(node.id);
        if (!scene)
            throw new Error('目标节点不在当前窗口场景树中');
        const buf = host.snapshotNode(scene);
        if (!buf)
            throw new Error('节点尚未完成布局（宽高为 0）或画布不可用');
        return buf;
    };
    return (react_1.default.createElement(file_saver_1.FileSaver, { data: snap, filename: filename, accept: ['.png'], title: title, disabled: disabled, onSaved: onSaved, style: style }));
}
exports.default = ChartExportButton;
