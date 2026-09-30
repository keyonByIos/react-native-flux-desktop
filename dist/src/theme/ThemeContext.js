"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeContext = exports.defaultTheme = void 0;
exports.hashStr = hashStr;
exports.mergeThemeConfig = mergeThemeConfig;
exports.createTheme = createTheme;
const react_1 = require("react");
const themes_1 = require("./themes");
const componentTokens_1 = require("./componentTokens");
/** Cheap djb2 string hash. */
function hashStr(input) {
    let h = 5381;
    for (let i = 0; i < input.length; i++) {
        h = (h * 33) ^ input.charCodeAt(i);
    }
    // keep it positive + base36 for a compact id
    return (h >>> 0).toString(36);
}
/** Shallow/deep merge a child theme config over a parent one. */
function mergeThemeConfig(parent, child) {
    if (!child)
        return parent;
    return {
        algorithm: child.algorithm ?? parent.algorithm,
        token: { ...parent.token, ...child.token },
        components: mergeComponents(parent.components, child.components),
    };
}
function mergeComponents(parent, child) {
    const p = parent;
    const c = child;
    if (!p)
        return child;
    if (!c)
        return parent;
    const out = { ...p };
    Object.keys(c).forEach((key) => {
        out[key] = {
            token: { ...(p[key]?.token ?? {}), ...(c[key]?.token ?? {}) },
        };
    });
    return out;
}
/** Build a full FluxTheme from a (already merged) config. */
function createTheme(config) {
    const token = (0, themes_1.buildAliasToken)(config.token, config.algorithm ?? 'default');
    const components = (0, componentTokens_1.buildComponentTokens)(token, config.components);
    const hashId = hashStr(JSON.stringify(config));
    return { token, components, hashId, config };
}
exports.defaultTheme = createTheme({});
exports.ThemeContext = (0, react_1.createContext)(exports.defaultTheme);
exports.ThemeContext.displayName = 'FluxThemeContext';
