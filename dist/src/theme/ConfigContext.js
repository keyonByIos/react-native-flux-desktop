"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigContext = exports.defaultConfig = void 0;
exports.useConfig = useConfig;
exports.useTimezone = useTimezone;
exports.useAnimationEnabled = useAnimationEnabled;
const react_1 = require("react");
/** 全局默认配置：时区固定为亚洲/上海，动画默认开启。 */
exports.defaultConfig = {
    timezone: 'Asia/Shanghai',
    animation: true,
};
exports.ConfigContext = (0, react_1.createContext)(exports.defaultConfig);
exports.ConfigContext.displayName = 'FluxConfigContext';
/** 读取当前生效的全局配置。 */
function useConfig() {
    return (0, react_1.useContext)(exports.ConfigContext);
}
/** 读取当前时区（等价 useConfig().timezone）。 */
function useTimezone() {
    return (0, react_1.useContext)(exports.ConfigContext).timezone;
}
/** 读取全局动画开关（等价 useConfig().animation）。动画原语据此决定补间还是直接落终值。 */
function useAnimationEnabled() {
    return (0, react_1.useContext)(exports.ConfigContext).animation;
}
