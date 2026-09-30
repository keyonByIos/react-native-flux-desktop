
export interface FluxConfig {

    timezone: string;

    animation: boolean;
}

export declare const defaultConfig: FluxConfig;
export declare const ConfigContext: import("react").Context<FluxConfig>;

export declare function useConfig(): FluxConfig;

export declare function useTimezone(): string;

export declare function useAnimationEnabled(): boolean;
