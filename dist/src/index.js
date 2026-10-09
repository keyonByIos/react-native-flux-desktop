"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemStats = exports.putCachedCanvas = exports.dropCachedCanvas = exports.getPaintDpr = exports.customBitmapStats = exports.imageCacheStats = exports.isImageReady = exports.preloadImages = exports.preloadImage = exports.registerFonts = exports.scheduleFrame = exports.Application = exports.appContainer = exports.getActiveHost = exports.hotReload = exports.grabAll = exports.render = exports.Window = exports.ScrollView = exports.Pressable = exports.Image = exports.Text = exports.View = exports.kv = exports.generate = exports.readability = exports.isValidColor = exports.transparentColor = exports.fade = exports.darken = exports.lighten = exports.mix = exports.hsvToRgb = exports.rgbToHsv = exports.rgbToHex = exports.parse = exports.useAnimationEnabled = exports.useTimezone = exports.useConfig = exports.defaultConfig = exports.ConfigContext = exports.buildComponentTokens = exports.buildAliasToken = exports.defaultSeed = exports.defaultTheme = exports.createTheme = exports.useToken = exports.ThemeContext = exports.ConfigProvider = exports.FluxProvider = void 0;
exports.setActiveEditable = exports.forgetEditable = exports.listFontFamilies = exports.SANS_FAMILY = exports.MONO_FAMILY = exports.writeClipboard = exports.isDarkTheme = exports.easeOutCubic = exports.styleAt = exports.presets = exports.runSequence = exports.useTransition = exports.Transition = exports.StaggerItem = exports.Stagger = exports.useFlip = exports.Flip = exports.useTransformTween = exports.useSpring = exports.useMotionValue = exports.RotateIn = exports.ScaleIn = exports.MoveIn = exports.useEnter = exports.FadeIn = exports.Easing = exports.subscribe = exports.useTween = exports.useAnimation = exports.enableConsoleCapture = exports.logsDir = exports.readLogEntries = exports.readLogTail = exports.logOverview = exports.loggerConfig = exports.configureLogger = exports.onSecondInstance = exports.isSingleInstanceEnforced = exports.releaseSingleInstance = exports.acquireSingleInstance = exports.systemConstantsJSON = exports.systemConstants = exports.systemStats = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./ui"), exports);
__exportStar(require("./pro"), exports);
__exportStar(require("./chart"), exports);
__exportStar(require("./web3"), exports);
__exportStar(require("./io"), exports);
__exportStar(require("./dev"), exports);
var theme_1 = require("./theme");
Object.defineProperty(exports, "FluxProvider", { enumerable: true, get: function () { return theme_1.FluxProvider; } });
Object.defineProperty(exports, "ConfigProvider", { enumerable: true, get: function () { return theme_1.ConfigProvider; } });
Object.defineProperty(exports, "ThemeContext", { enumerable: true, get: function () { return theme_1.ThemeContext; } });
Object.defineProperty(exports, "useToken", { enumerable: true, get: function () { return theme_1.useToken; } });
Object.defineProperty(exports, "createTheme", { enumerable: true, get: function () { return theme_1.createTheme; } });
Object.defineProperty(exports, "defaultTheme", { enumerable: true, get: function () { return theme_1.defaultTheme; } });
Object.defineProperty(exports, "defaultSeed", { enumerable: true, get: function () { return theme_1.defaultSeed; } });
Object.defineProperty(exports, "buildAliasToken", { enumerable: true, get: function () { return theme_1.buildAliasToken; } });
Object.defineProperty(exports, "buildComponentTokens", { enumerable: true, get: function () { return theme_1.buildComponentTokens; } });
Object.defineProperty(exports, "ConfigContext", { enumerable: true, get: function () { return theme_1.ConfigContext; } });
Object.defineProperty(exports, "defaultConfig", { enumerable: true, get: function () { return theme_1.defaultConfig; } });
Object.defineProperty(exports, "useConfig", { enumerable: true, get: function () { return theme_1.useConfig; } });
Object.defineProperty(exports, "useTimezone", { enumerable: true, get: function () { return theme_1.useTimezone; } });
Object.defineProperty(exports, "useAnimationEnabled", { enumerable: true, get: function () { return theme_1.useAnimationEnabled; } });
__exportStar(require("./utils/timezone"), exports);
// 对外补齐：颜色工具（demo 里的 fade/generate/readability 等）、KV 存储命名空间（sys-kv demo）
var color_1 = require("./utils/color");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return color_1.parse; } });
Object.defineProperty(exports, "rgbToHex", { enumerable: true, get: function () { return color_1.rgbToHex; } });
Object.defineProperty(exports, "rgbToHsv", { enumerable: true, get: function () { return color_1.rgbToHsv; } });
Object.defineProperty(exports, "hsvToRgb", { enumerable: true, get: function () { return color_1.hsvToRgb; } });
Object.defineProperty(exports, "mix", { enumerable: true, get: function () { return color_1.mix; } });
Object.defineProperty(exports, "lighten", { enumerable: true, get: function () { return color_1.lighten; } });
Object.defineProperty(exports, "darken", { enumerable: true, get: function () { return color_1.darken; } });
Object.defineProperty(exports, "fade", { enumerable: true, get: function () { return color_1.fade; } });
Object.defineProperty(exports, "transparentColor", { enumerable: true, get: function () { return color_1.transparentColor; } });
Object.defineProperty(exports, "isValidColor", { enumerable: true, get: function () { return color_1.isValidColor; } });
Object.defineProperty(exports, "readability", { enumerable: true, get: function () { return color_1.readability; } });
Object.defineProperty(exports, "generate", { enumerable: true, get: function () { return color_1.generate; } });
exports.kv = __importStar(require("./app/db"));
var components_1 = require("./components");
Object.defineProperty(exports, "View", { enumerable: true, get: function () { return components_1.View; } });
Object.defineProperty(exports, "Text", { enumerable: true, get: function () { return components_1.Text; } });
Object.defineProperty(exports, "Image", { enumerable: true, get: function () { return components_1.Image; } });
Object.defineProperty(exports, "Pressable", { enumerable: true, get: function () { return components_1.Pressable; } });
Object.defineProperty(exports, "ScrollView", { enumerable: true, get: function () { return components_1.ScrollView; } });
Object.defineProperty(exports, "Window", { enumerable: true, get: function () { return components_1.Window; } });
var renderer_1 = require("./renderer");
Object.defineProperty(exports, "render", { enumerable: true, get: function () { return renderer_1.render; } });
Object.defineProperty(exports, "grabAll", { enumerable: true, get: function () { return renderer_1.grabAll; } });
Object.defineProperty(exports, "hotReload", { enumerable: true, get: function () { return renderer_1.hotReload; } });
var reconciler_1 = require("./reconciler");
Object.defineProperty(exports, "getActiveHost", { enumerable: true, get: function () { return reconciler_1.getActiveHost; } });
var reconciler_2 = require("./reconciler");
Object.defineProperty(exports, "appContainer", { enumerable: true, get: function () { return reconciler_2.appContainer; } });
// 全局 Application 单例：窗口注册表 + 系统配置(Application.config) + 用户存储(Application.user) + 模态门控（任意处 import { Application } 可用）
// 注：antd 风格的 <App> 包裹组件（App.useApp 全局调 message/modal/notification）经 './ui' 透传导出。
var app_1 = require("./app");
Object.defineProperty(exports, "Application", { enumerable: true, get: function () { return app_1.Application; } });
var scheduler_1 = require("./frame/scheduler");
Object.defineProperty(exports, "scheduleFrame", { enumerable: true, get: function () { return scheduler_1.scheduleFrame; } });
var fonts_1 = require("./paint/fonts");
Object.defineProperty(exports, "registerFonts", { enumerable: true, get: function () { return fonts_1.registerFonts; } });
var painter_1 = require("./paint/painter");
Object.defineProperty(exports, "preloadImage", { enumerable: true, get: function () { return painter_1.preloadImage; } });
Object.defineProperty(exports, "preloadImages", { enumerable: true, get: function () { return painter_1.preloadImages; } });
Object.defineProperty(exports, "isImageReady", { enumerable: true, get: function () { return painter_1.isImageReady; } });
Object.defineProperty(exports, "imageCacheStats", { enumerable: true, get: function () { return painter_1.imageCacheStats; } });
Object.defineProperty(exports, "customBitmapStats", { enumerable: true, get: function () { return painter_1.customBitmapStats; } });
Object.defineProperty(exports, "getPaintDpr", { enumerable: true, get: function () { return painter_1.getPaintDpr; } });
Object.defineProperty(exports, "dropCachedCanvas", { enumerable: true, get: function () { return painter_1.dropCachedCanvas; } });
Object.defineProperty(exports, "putCachedCanvas", { enumerable: true, get: function () { return painter_1.putCachedCanvas; } });
// 系统运行时取数门面（内存/图片缓存/逐窗面/帧率/GC）：单例 systemStats 任意处即时快照，或自建面板
// 另导出 systemConstants：进程启动即定的静态环境常量（平台/架构/OS/用户/硬件容量/Node 版本/时区），纯 os+process、只读冻结
var system_1 = require("./system");
Object.defineProperty(exports, "SystemStats", { enumerable: true, get: function () { return system_1.SystemStats; } });
Object.defineProperty(exports, "systemStats", { enumerable: true, get: function () { return system_1.systemStats; } });
Object.defineProperty(exports, "systemConstants", { enumerable: true, get: function () { return system_1.systemConstants; } });
Object.defineProperty(exports, "systemConstantsJSON", { enumerable: true, get: function () { return system_1.systemConstantsJSON; } });
// 单实例锁 + 次实例唤起：生产环境保证全局只跑一个进程，开发环境放行可多开（入口建窗前调 acquireSingleInstance）；
// 主实例起本地 IPC（命名管道/unix socket），次实例抢锁失败时通知主实例 → onSecondInstance 回调（上层 wakeMainWindow 唤老窗）。
var instance_1 = require("./window/instance");
Object.defineProperty(exports, "acquireSingleInstance", { enumerable: true, get: function () { return instance_1.acquireSingleInstance; } });
Object.defineProperty(exports, "releaseSingleInstance", { enumerable: true, get: function () { return instance_1.releaseSingleInstance; } });
Object.defineProperty(exports, "isSingleInstanceEnforced", { enumerable: true, get: function () { return instance_1.isSingleInstanceEnforced; } });
Object.defineProperty(exports, "onSecondInstance", { enumerable: true, get: function () { return instance_1.onSecondInstance; } });
// 日志系统：入口按 app.json.logger 调 configureLogger；用户日志走 App.log.init/write；
// 以下为查看/配置接口。系统日志写点（sysLog）属核心内部专用，不对外导出（用户不可写系统日志）。
var log_1 = require("./log");
Object.defineProperty(exports, "configureLogger", { enumerable: true, get: function () { return log_1.configureLogger; } });
Object.defineProperty(exports, "loggerConfig", { enumerable: true, get: function () { return log_1.loggerConfig; } });
Object.defineProperty(exports, "logOverview", { enumerable: true, get: function () { return log_1.logOverview; } });
Object.defineProperty(exports, "readLogTail", { enumerable: true, get: function () { return log_1.readLogTail; } });
Object.defineProperty(exports, "readLogEntries", { enumerable: true, get: function () { return log_1.readLogEntries; } });
Object.defineProperty(exports, "logsDir", { enumerable: true, get: function () { return log_1.logsDir; } });
Object.defineProperty(exports, "enableConsoleCapture", { enumerable: true, get: function () { return log_1.enableConsoleCapture; } });
var anim_1 = require("./anim");
Object.defineProperty(exports, "useAnimation", { enumerable: true, get: function () { return anim_1.useAnimation; } });
Object.defineProperty(exports, "useTween", { enumerable: true, get: function () { return anim_1.useTween; } });
Object.defineProperty(exports, "subscribe", { enumerable: true, get: function () { return anim_1.subscribe; } });
Object.defineProperty(exports, "Easing", { enumerable: true, get: function () { return anim_1.Easing; } });
Object.defineProperty(exports, "FadeIn", { enumerable: true, get: function () { return anim_1.FadeIn; } });
Object.defineProperty(exports, "useEnter", { enumerable: true, get: function () { return anim_1.useEnter; } });
Object.defineProperty(exports, "MoveIn", { enumerable: true, get: function () { return anim_1.MoveIn; } });
Object.defineProperty(exports, "ScaleIn", { enumerable: true, get: function () { return anim_1.ScaleIn; } });
Object.defineProperty(exports, "RotateIn", { enumerable: true, get: function () { return anim_1.RotateIn; } });
Object.defineProperty(exports, "useMotionValue", { enumerable: true, get: function () { return anim_1.useMotionValue; } });
Object.defineProperty(exports, "useSpring", { enumerable: true, get: function () { return anim_1.useSpring; } });
Object.defineProperty(exports, "useTransformTween", { enumerable: true, get: function () { return anim_1.useTransformTween; } });
Object.defineProperty(exports, "Flip", { enumerable: true, get: function () { return anim_1.Flip; } });
Object.defineProperty(exports, "useFlip", { enumerable: true, get: function () { return anim_1.useFlip; } });
Object.defineProperty(exports, "Stagger", { enumerable: true, get: function () { return anim_1.Stagger; } });
Object.defineProperty(exports, "StaggerItem", { enumerable: true, get: function () { return anim_1.StaggerItem; } });
Object.defineProperty(exports, "Transition", { enumerable: true, get: function () { return anim_1.Transition; } });
Object.defineProperty(exports, "useTransition", { enumerable: true, get: function () { return anim_1.useTransition; } });
Object.defineProperty(exports, "runSequence", { enumerable: true, get: function () { return anim_1.runSequence; } });
Object.defineProperty(exports, "presets", { enumerable: true, get: function () { return anim_1.presets; } });
Object.defineProperty(exports, "styleAt", { enumerable: true, get: function () { return anim_1.styleAt; } });
var easing_1 = require("./anim/easing");
Object.defineProperty(exports, "easeOutCubic", { enumerable: true, get: function () { return easing_1.easeOutCubic; } });
// 组件族拆独立包补齐：pro/web3/dev 独立包经裸包名回取的核心符号（原经深层相对路径直连，拆包后统一走 barrel）
var shared_1 = require("./theme/themes/shared");
Object.defineProperty(exports, "isDarkTheme", { enumerable: true, get: function () { return shared_1.isDarkTheme; } });
var clipboard_1 = require("./window/clipboard");
Object.defineProperty(exports, "writeClipboard", { enumerable: true, get: function () { return clipboard_1.writeClipboard; } });
var fonts_2 = require("./paint/fonts");
Object.defineProperty(exports, "MONO_FAMILY", { enumerable: true, get: function () { return fonts_2.MONO_FAMILY; } });
Object.defineProperty(exports, "SANS_FAMILY", { enumerable: true, get: function () { return fonts_2.SANS_FAMILY; } });
Object.defineProperty(exports, "listFontFamilies", { enumerable: true, get: function () { return fonts_2.listFontFamilies; } });
var textinput_1 = require("./events/textinput");
Object.defineProperty(exports, "forgetEditable", { enumerable: true, get: function () { return textinput_1.forgetEditable; } });
Object.defineProperty(exports, "setActiveEditable", { enumerable: true, get: function () { return textinput_1.setActiveEditable; } });
