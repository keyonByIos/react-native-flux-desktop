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
exports.ConfigProvider = void 0;
exports.FluxProvider = FluxProvider;
const react_1 = __importStar(require("react"));
const ThemeContext_1 = require("./ThemeContext");
const ConfigContext_1 = require("./ConfigContext");
const painter_1 = require("../paint/painter");
/**
 * Root provider that resolves the design-token pyramid and publishes it via
 * context. Nest multiple providers to scope theme overrides to a subtree.
 */
function FluxProvider({ theme, timezone, animation, children }) {
    const parentTheme = (0, react_1.useContext)(ThemeContext_1.ThemeContext);
    const value = (0, react_1.useMemo)(() => {
        if (!theme)
            return parentTheme;
        const merged = (0, ThemeContext_1.mergeThemeConfig)(parentTheme.config, theme);
        return (0, ThemeContext_1.createTheme)(merged);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentTheme, theme]);
    const parentConfig = (0, react_1.useContext)(ConfigContext_1.ConfigContext);
    const config = (0, react_1.useMemo)(() => {
        let c = parentConfig;
        if (timezone !== undefined)
            c = { ...c, timezone };
        if (animation !== undefined)
            c = { ...c, animation };
        return c;
    }, [parentConfig, timezone, animation]);
    // 裸 Text/Icon（未显式 color）的绘制兜底色跟随主题：暗色主题下否则黑字压深底不可见。
    // 取最外层 Provider 生效；嵌套子树不同主题时全局兜底色以最后提交者为准（组件均应显式取 token，不依赖兜底）
    (0, react_1.useEffect)(() => {
        (0, painter_1.setDefaultTextColor)(value.token.colorText);
    }, [value]);
    return (react_1.default.createElement(ConfigContext_1.ConfigContext.Provider, { value: config },
        react_1.default.createElement(ThemeContext_1.ThemeContext.Provider, { value: value }, children)));
}
/** Alias matching antd's naming convention. */
exports.ConfigProvider = FluxProvider;
