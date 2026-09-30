"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Affix = Affix;
// AFFIX：滚动钉顶。沿用 BackTop 的「受控 scrollY 喂入」管线（本栈无全局滚动监听）：
// 使用者在 ScrollView onScroll 里把偏移喂给 scrollY。钉住判定用「自身绝对 y - 视口绝对 y」
// 与 offset 比较——绝对坐标由 onLayoutAbs 在偏移变化时重报（host 每帧布局后比对派发）。
// 钉住时内容转绝对定位浮层（占位 View 撑住文档流防跳动），背景+投影保证可读叠放。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function Affix(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, offset = 0, scrollY = 0, onAffix, style } = props;
    const selfAbs = react_1.default.useRef({ y: 0 }); // 探针层窗口绝对 y（可见时随滚动重报；滚出视口后布局不脏、停报）
    const base = react_1.default.useRef({ y: 0, s: 0 }); // 探针某次报值的采样基准：自然位 ≈ base.y - (scrollY - base.s)
    const viewAbs = react_1.default.useRef({ y: 0 }); // 滚动视口窗口绝对 y
    const [box, setBox] = react_1.default.useState({ w: 0, h: 0 }); // 自然态尺寸（仅未钉住时采样，防「隐藏内容→测得 0→掉钉」振荡）
    const lastRef = react_1.default.useRef(false);
    const onSelfAbs = (e) => {
        const y = e.nativeEvent.layout.y;
        if (y !== selfAbs.current.y) {
            selfAbs.current.y = y;
            base.current = { y, s: scrollY }; // 新鲜采样，重置基准
        }
    };
    // 自然顶边相对视口：实测与基准公式取 min——探针滚出视口后停报（布局不脏），
    // 继续下滚靠 base.y-(scrollY-base.s) 外推；往回滚探针重现即重报接管（min 自动切回实测）
    void scrollY; // 偏移变化时触发重渲染，浮层位置随之逐帧更新
    const measured = selfAbs.current.y - viewAbs.current.y;
    const selfTop = Math.min(measured, base.current.y - (scrollY - base.current.s) - viewAbs.current.y);
    const affixed = box.w > 0 && box.h > 0 && selfTop - offset < -0.5;
    if (affixed !== lastRef.current) {
        lastRef.current = affixed;
        onAffix && onAffix(affixed);
    }
    // 钉住浮层相对根盒的顶边：贴自然位（自然位已升到 offset 之上后才吸顶）；
    // 若直接落 offset，钉住瞬间会向下跳并漏出占位背景带
    const floatTop = Math.max(selfTop, offset) - selfTop;
    return (react_1.default.createElement(components_1.View, null,
        react_1.default.createElement(components_1.View, { style: { height: 0 }, onLayoutAbs: (e) => (viewAbs.current.y = e.nativeEvent.layout.y) }),
        react_1.default.createElement(components_1.View, { style: { height: 0 }, onLayoutAbs: onSelfAbs }),
        react_1.default.createElement(components_1.View, { onLayout: (e) => {
                const l = e.nativeEvent.layout;
                if (!lastRef.current && (l.w > 0 || l.h > 0))
                    setBox({ w: l.w, h: l.h });
            } }, affixed ? null : children),
        affixed ? react_1.default.createElement(components_1.View, { style: { height: box.h } }) : null,
        affixed ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: 0,
                top: floatTop,
                width: box.w,
                zIndex: 900,
                backgroundColor: token.colorBgContainer,
                borderRadius: token.borderRadius,
                paddingVertical: token.paddingXXS,
                shadowColor: 'rgba(0,0,0,0.14)',
                shadowOpacity: 1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 3 },
                pointerEvents: 'none',
            } }, children)) : null));
}
exports.default = Affix;
