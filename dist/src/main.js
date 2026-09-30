"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 最小闭环入口（M1）：React 树 → 场景树 → Yoga 布局 → Skia 绘制 → winit 上屏。
// 验证「一套 React 代码，换掉 Qt 壳」这最后一关：一个可点计数按钮 + 一个可滚列表。
const react_1 = __importDefault(require("react"));
const index_1 = require("./index");
function App() {
    const [count, setCount] = react_1.default.useState(0);
    return (react_1.default.createElement(index_1.Window, { title: "Flux Desktop (winit) \u2014 M1 closed loop", width: 520, height: 420 },
        react_1.default.createElement(index_1.View, { style: {
                flex: 1,
                backgroundColor: '#f5f5f5',
                padding: 20,
            } },
            react_1.default.createElement(index_1.Text, { style: { fontSize: 22, fontWeight: '600', color: '#1f1f1f', marginBottom: 6 } }, "winit + Skia + react-reconciler"),
            react_1.default.createElement(index_1.Text, { style: { fontSize: 13, color: '#8c8c8c', marginBottom: 16 } }, "\u70B9\u51FB\u6309\u94AE\u7D2F\u52A0 \u00B7 \u5728\u4E0B\u65B9\u5217\u8868\u6EDA\u52A8\u6EDA\u8F6E"),
            react_1.default.createElement(index_1.Pressable, { onPress: () => setCount((c) => c + 1), style: {
                    width: 180,
                    height: 52,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#1677ff',
                    marginBottom: 16,
                } },
                react_1.default.createElement(index_1.Text, { style: { fontSize: 16, fontWeight: '600', color: '#ffffff' } },
                    "\u70B9\u6211 \u00B7 count = ",
                    count)),
            react_1.default.createElement(index_1.ScrollView, { style: { flex: 1, backgroundColor: '#ffffff', borderRadius: 10, padding: 12 } }, Array.from({ length: 40 }).map((_, i) => (react_1.default.createElement(index_1.View, { key: i, style: {
                    height: 34,
                    justifyContent: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                } },
                react_1.default.createElement(index_1.Text, { style: { fontSize: 14, color: '#595959' } },
                    "\u5217\u8868\u884C #",
                    i + 1))))))));
}
(0, index_1.render)(react_1.default.createElement(App)).then(() => {
    console.log('[main] first commit done; pump loop driving frames. Interact with the window.');
});
// 验证用：设 FLUX_GRAB=<目录> 时，首帧稳定后把窗口抓成 PNG，供无交互下的像素核对
if (process.env.FLUX_GRAB) {
    const dir = process.env.FLUX_GRAB;
    setTimeout(() => {
        (0, index_1.grabAll)(dir);
        console.log('[main] grabbed to ' + dir);
    }, 1500);
}
