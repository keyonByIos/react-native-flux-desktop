import React from 'react';
import type { ReactNode } from 'react';
import type { ThemeConfig } from './interface';
export interface FluxProviderProps {

    theme?: ThemeConfig;

    timezone?: string;

    animation?: boolean;
    children?: ReactNode;
}

export declare function FluxProvider({ theme, timezone, animation, children }: FluxProviderProps): React.JSX.Element;

export declare const ConfigProvider: typeof FluxProvider;
