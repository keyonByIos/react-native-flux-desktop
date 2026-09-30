import type { AliasToken, ComponentTokenMap, ThemeConfig } from './interface';
/** Value carried by the theme context down the tree. */
export interface FluxTheme {
    token: AliasToken;
    components: ComponentTokenMap;
    /** Stable hash for the current config — used to key cached stylesheets. */
    hashId: string;
    config: ThemeConfig;
}
/** Cheap djb2 string hash. */
export declare function hashStr(input: string): string;
/** Shallow/deep merge a child theme config over a parent one. */
export declare function mergeThemeConfig(parent: ThemeConfig, child?: ThemeConfig): ThemeConfig;
/** Build a full FluxTheme from a (already merged) config. */
export declare function createTheme(config: ThemeConfig): FluxTheme;
export declare const defaultTheme: FluxTheme;
export declare const ThemeContext: import("react").Context<FluxTheme>;
