"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOverlayGate = useOverlayGate;
// useOverlayGate：给一个浮层组件接上「点击空白处关闭 + 同屏互斥」。
// 用法：组件算出 active（是否处于「可被外部点击关闭」的打开态：受控常驻展开/hover 触发应传 false），
// 提供 close（外部点击时请求关闭），把返回的 onTriggerAbs/onPanelAbs 分别挂到触发器盒与面板盒
// （两者都需绝对坐标上报 onLayoutAbs，供 host 全局 press 命中判定）。
const react_1 = __importDefault(require("react"));
const coordinator_1 = require("./coordinator");
function useOverlayGate(active, close) {
    const rectsRef = react_1.default.useRef([]);
    const closeRef = react_1.default.useRef(close);
    closeRef.current = close;
    react_1.default.useEffect(() => {
        if (!active)
            return;
        return (0, coordinator_1.registerOverlay)({
            rects: rectsRef.current,
            close: () => closeRef.current(),
        });
    }, [active]);
    const onTriggerAbs = (e) => {
        rectsRef.current[0] = e.nativeEvent.layout;
    };
    const onPanelAbs = (e) => {
        rectsRef.current[1] = e.nativeEvent.layout;
    };
    return { onTriggerAbs, onPanelAbs };
}
exports.default = useOverlayGate;
