"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToken = useToken;
const react_1 = require("react");
const ThemeContext_1 = require("./ThemeContext");
/** Access the resolved theme tokens from the nearest <FluxProvider />. */
function useToken() {
    const theme = (0, react_1.useContext)(ThemeContext_1.ThemeContext);
    return {
        token: theme.token,
        components: theme.components,
        hashId: theme.hashId,
        getComponentToken: (name) => theme.components[name].token,
    };
}
