"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfiniteScroll = InfiniteScroll;
// InfiniteScroll：滚动到底部自动加载下一页的滚动容器。
// 参照移动端仓库版与 antd-mobile：footer 三态（加载中 / 没有更多 / 失败+重试），
// 触底判定基于 host 上报的 contentOffset/contentSize + 视口 onLayout 自测高，
// 每次「接近底部」只触发一次，新内容把 footer 推远后自然重新武装（fired ref + 迟滞）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useAnimation_1 = require("../../anim/useAnimation");
/**
 * 滚动容器 + 触底加载 + footer 状态机。须给出有界高度（flex:1 或固定高）。
 */
function InfiniteScroll(props) {
    const { children, hasMore, onLoadMore, loading = false, error = false, onRetry, threshold = 0.4, loadingText = '加载中…', noMoreText = '— 没有更多了 —', errorText = '加载失败', retryText = '重试', style, contentContainerStyle, } = props;
    const { token } = (0, theme_1.useToken)();
    const viewportH = react_1.default.useRef(0);
    const contentH = react_1.default.useRef(0);
    const contentY = react_1.default.useRef(0);
    const fired = react_1.default.useRef(false);
    // 数据变化（新一页追加 / 失败后重试成功）会把 footer 推远或拉近：
    // children 数变化即复位 fired，允许在同一滚动位置连续追页时再次触发
    const armKey = react_1.default.useMemo(() => react_1.default.Children.count(children), [children]);
    react_1.default.useEffect(() => {
        fired.current = false;
    }, [armKey, error, loading]);
    const check = react_1.default.useCallback(() => {
        if (!hasMore || error || loading || !onLoadMore)
            return;
        const remaining = contentH.current - (viewportH.current ? contentY.current + viewportH.current : 0);
        // 视口高未知（尚未 onLayout）不判定
        if (!viewportH.current)
            return;
        const limit = viewportH.current * threshold;
        if (!fired.current && remaining <= limit) {
            fired.current = true;
            onLoadMore();
        }
        else if (fired.current && remaining > limit * 1.5) {
            fired.current = false;
        }
    }, [hasMore, error, loading, onLoadMore, threshold]);
    const onScroll = react_1.default.useCallback((e) => {
        contentY.current = e.nativeEvent.contentOffset.y;
        contentH.current = e.nativeEvent.contentSize.height;
        check();
    }, [check]);
    const footerBase = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: token.marginXS,
        paddingVertical: token.padding,
    };
    return (react_1.default.createElement(components_1.ScrollView, { style: [{ flex: 1 }, style], onScroll: onScroll, onLayout: (e) => {
            viewportH.current = e.nativeEvent.layout.h;
            check();
        }, contentContainerStyle: contentContainerStyle },
        children,
        react_1.default.createElement(components_1.View, { style: footerBase }, error ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, errorText),
            onRetry ? (react_1.default.createElement(components_1.Pressable, { onPress: onRetry, style: { cursor: 'pointer' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorPrimary } }, retryText))) : null)) : hasMore ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(FooterSpinner, { spinning: loading }),
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, loadingText))) : (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, noMoreText)))));
}
exports.default = InfiniteScroll;
/** footer 小号转圈：18px 弧线，与文字等高；不转时保留占位避免文案抖动 */
function FooterSpinner(props) {
    const { token } = (0, theme_1.useToken)();
    const angle = (0, useAnimation_1.useAnimation)({ duration: 900, loop: true, playing: props.spinning }) * 360;
    return (react_1.default.createElement(components_1.View, { style: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' } },
        react_1.default.createElement(icon_1.Icon, { name: "loading", size: 18, color: props.spinning ? token.colorPrimary : token.colorTextQuaternary, strokeWidth: 2.5, rotate: angle })));
}
