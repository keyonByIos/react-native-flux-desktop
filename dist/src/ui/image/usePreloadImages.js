"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePreloadImages = usePreloadImages;
// usePreloadImages：在组件挂载 / uri 列表变化时，提前把图片解码进 painter 缓存，
// 使后续（或下一屏）真正渲染 <Image> 时直接命中，消除首帧留白。
// 典型场景：走马灯预热其余屏、Tabs 预热未激活标签页的图、列表页预热下一页。
const react_1 = __importDefault(require("react"));
const painter_1 = require("../../paint/painter");
function usePreloadImages(uris) {
    // 用稳定签名做依赖，避免每次渲染新数组引用导致重复触发
    const key = uris.filter(Boolean).join('|');
    react_1.default.useEffect(() => {
        (0, painter_1.preloadImages)(uris);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
}
exports.default = usePreloadImages;
