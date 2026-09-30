"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasLayer = CanvasLayer;
// CanvasLayer：把任意图表内容「命令式」画进一张 dpr 超采样离屏 canvas，再用单个 <Image> 节点显示。
// 本栈 image 节点即画 painter 里 customBitmaps.get(key) 返回的 canvas，故整块矢量内容 = 1 个渲染节点，
// 取代「每段/每点/每格一个 View」的 O(n) 场景树（layout/hitTest/paint 每帧都走，是内存与帧成本大头）。
// 依赖：painter 的 putCachedCanvas/dropCachedCanvas/getPaintDpr；组件卸载 dropCachedCanvas 回收。
const react_1 = __importDefault(require("react"));
const canvas_1 = require("@napi-rs/canvas");
const components_1 = require("../../components");
const painter_1 = require("../../paint/painter");
let CANVAS_SEQ = 0;
/**
 * 离屏位图承载层：单节点显示一张自绘 canvas。
 * dpr 取 max(2, 当前 paintDpr)：静态图首帧 paintDpr 未定时也 ≥2× 避免发虚；dpr=2 屏精确 1:1。
 */
function CanvasLayer(props) {
    const { width: w, height: h, draw, deps, style } = props;
    const uidRef = react_1.default.useRef(null);
    if (uidRef.current == null)
        uidRef.current = ++CANVAS_SEQ;
    const key = 'fluxcanvas:' + uidRef.current;
    // 用 deps 序列化做稳定依赖签（CanvasLayer 自身按 key/w/h + 调用方 deps 重建）
    const sig = JSON.stringify(deps);
    react_1.default.useLayoutEffect(() => {
        if (!(w > 0) || !(h > 0))
            return;
        const dpr = Math.max(2, (0, painter_1.getPaintDpr)() || 2);
        const cw = Math.max(1, Math.round(w * dpr));
        const chh = Math.max(1, Math.round(h * dpr));
        const c = (0, canvas_1.createCanvas)(cw, chh);
        const cx = c.getContext('2d');
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx.clearRect(0, 0, w, h);
        try {
            draw(cx, w, h, dpr);
        }
        catch {
            /* 绘制异常不得打断渲染帧 */
        }
        (0, painter_1.putCachedCanvas)(key, c);
        return () => (0, painter_1.dropCachedCanvas)(key);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, w, h, sig]);
    return (react_1.default.createElement(components_1.Image, { source: key, resizeMode: "contain", style: [{ position: 'absolute', left: 0, top: 0, width: w, height: h }, style] }));
}
exports.default = CanvasLayer;
