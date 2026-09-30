import React from 'react';
import type { ReactNode } from 'react';
import type { ThemeConfig } from './interface';
export interface FluxProviderProps {
    /** Theme configuration: token overrides, component tokens, algorithm. */
    theme?: ThemeConfig;
    /**
     * IANA timezone for date/time components (Calendar / DatePicker / TimePicker).
     * Defaults to 'Asia/Shanghai' (中国上海). Nested providers override the parent.
     */
    timezone?: string;
    /**
     * Global animation switch. When `false`, every component animation collapses to its
     * final state instantly (no tween / entrance / looping motion). Nested providers override
     * the parent. Omit to inherit; the root default is enabled.
     */
    animation?: boolean;
    children?: ReactNode;
}
/**
 * Root provider that resolves the design-token pyramid and publishes it via
 * context. Nest multiple providers to scope theme overrides to a subtree.
 */
export declare function FluxProvider({ theme, timezone, animation, children }: FluxProviderProps): React.JSX.Element;
/** Alias matching antd's naming convention. */
export declare const ConfigProvider: typeof FluxProvider;
