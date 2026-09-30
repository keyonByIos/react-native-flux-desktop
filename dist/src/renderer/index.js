"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = render;
exports.grabAll = grabAll;
// Renderer：对外唯一的渲染入口。render() 会先等 Yoga 的 WASM 就绪再挂载。
// 多窗口：每次挂载（render / Application.open）都开一个独立的 React 根容器（各 own Set），
//   一个 <Window> 根 → reconciler trackHost 自动建一扇 WindowHost。Application.open 经工厂命令式加窗。
const react_1 = __importDefault(require("react"));
const reconciler_1 = __importDefault(require("../reconciler"));
const yoga_1 = require("../layout/yoga");
const fonts_1 = require("../paint/fonts");
const components_1 = require("../components");
const app_1 = require("../app");
const log_1 = require("../log");
let started = Promise.resolve();
/** Yoga(WASM) 与字体是异步/一次性初始化，所有 render 都排在它后面 */
function bootstrap() {
    (0, log_1.enableConsoleCapture)();
    (0, log_1.sysLog)('[app] bootstrap: initializing Yoga(WASM) + fonts');
    started = started
        .then(async () => {
        await (0, yoga_1.initYoga)();
        (0, fonts_1.registerFonts)();
    })
        .catch((e) => {
        console.error('[flux-skia] bootstrap failed: ' + (e && e.stack ? e.stack : e));
    });
    return started;
}
function render(element, options) {
    return bootstrap().then(() => {
        mountToNewRoot(element, () => {
            options && options.onRender && options.onRender();
        });
    });
}
/** 把一棵元素树挂进一个全新的 React 根容器（多窗口 = 多根，互不干扰）。 */
function mountToNewRoot(element, onCommit) {
    const container = new Set();
    const c = reconciler_1.default.createContainer(container, 1 /* ConcurrentRoot */, null, false, null);
    reconciler_1.default.updateContainer(element, c, null, () => {
        onCommit && onCommit();
    });
}
// 命令式开窗工厂：Application.open 转交这里，把 content 包进一扇独立 <Window> 根。
// 在 bootstrap 之后挂载（首窗通常已把 Yoga/字体初始化好，后续 render 直接命中已就绪的 started）。
app_1.Application.__setWindowFactory((opts) => {
    const winEl = react_1.default.createElement(components_1.Window, {
        title: opts.title ?? 'Flux',
        width: opts.width ?? 480,
        height: opts.height ?? 360,
        x: opts.x,
        y: opts.y,
        parentId: opts.parentId,
        modal: opts.modal,
        alwaysOnTop: opts.alwaysOnTop,
        tag: opts.tag,
        resizable: opts.resizable,
        minWidth: opts.minWidth,
        minHeight: opts.minHeight,
        maxWidth: opts.maxWidth,
        maxHeight: opts.maxHeight,
        decorations: opts.decorations,
        transparent: opts.transparent,
        maximized: opts.maximized,
        center: opts.center,
        onPreparing: opts.onPreparing,
        onLoading: opts.onLoading,
        onReady: opts.onReady,
        onClose: opts.onClose,
        onFocused: opts.onFocused,
    }, opts.content);
    bootstrap().then(() => mountToNewRoot(winEl));
});
/** 调试辅助：把所有窗口的当前帧抓成 PNG，用于像素级验证。
 * 统一输出目录 + 名称区分：设 FLUX_GRAB_NAME=<名称> 时写成 <dir>/<名称>.png（多窗口追加 -1/-2…）；
 * 未设则退回旧的 <dir>/window-<i>.png。 */
function grabAll(dir) {
    try {
        require('fs').mkdirSync(dir, { recursive: true });
    }
    catch (e) {
        /* 已存在 */
    }
    const name = process.env.FLUX_GRAB_NAME;
    let i = 0;
    for (const rec of app_1.Application.windows()) {
        const host = rec.host;
        if (!host)
            continue;
        host.renderFrame();
        const suffix = name ? (i === 0 ? name : `${name}-${i}`) : `window-${i}`;
        host.grab(`${dir}/${suffix}.png`);
        i++;
    }
}
// qode 的模块生命周期较短，钉住关键对象防止被 GC
global.__FLUX_REACT__ = react_1.default;
