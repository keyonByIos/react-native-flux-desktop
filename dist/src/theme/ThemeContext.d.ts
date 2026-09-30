import type { AliasToken, ComponentTokenMap, ThemeConfig } from './interface';

export interface FluxTheme {
    token: AliasToken;
    components: ComponentTokenMap;

    hashId: string;
    config: ThemeConfig;
}

export declare function hashStr(input: string): string;

export declare function mergeThemeConfig(parent: ThemeConfig, child?: ThemeConfig): ThemeConfig;

export declare function createTheme(config: ThemeConfig): FluxTheme;
export declare const defaultTheme: FluxTheme;
export declare const ThemeContext: import("react").Context<FluxTheme>;
