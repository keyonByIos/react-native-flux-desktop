/**
 * 全局非主题类配置（对齐 antd ConfigProvider 的 locale / timezone 等能力）。
 * 与 Token 主题分开维护：主题走 ThemeContext，这类运行时配置走 ConfigContext。
 */
export interface FluxConfig {
    /**
     * IANA 时区名，日期 / 时间类组件（Calendar / DatePicker / TimePicker）据此换算「今天」、
     * 网格排布与格式化。默认中国上海。
     */
    timezone: string;
    /**
     * 全局动画开关。false 时所有组件动画即时落终态（补间 / 入场 / 循环动效均取消，无逐帧过渡）。
     * 由 <FluxProvider animation={false}> 下发；动画原语据此决定补间还是直接给终值。
     */
    animation: boolean;
}
/** 全局默认配置：时区固定为亚洲/上海，动画默认开启。 */
export declare const defaultConfig: FluxConfig;
export declare const ConfigContext: import("react").Context<FluxConfig>;
/** 读取当前生效的全局配置。 */
export declare function useConfig(): FluxConfig;
/** 读取当前时区（等价 useConfig().timezone）。 */
export declare function useTimezone(): string;
/** 读取全局动画开关（等价 useConfig().animation）。动画原语据此决定补间还是直接落终值。 */
export declare function useAnimationEnabled(): boolean;
