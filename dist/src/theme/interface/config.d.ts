import type { AliasToken } from './alias';
import type { SeedToken } from './seed';
import type { ComponentTokenMap } from './components';

export type ThemeAlgorithm = 'default' | 'dark' | 'compact';

export interface ThemeConfig {
    token?: Partial<SeedToken> & Partial<AliasToken>;
    components?: {
        [K in keyof ComponentTokenMap]?: {
            token?: Partial<ComponentTokenMap[K]['token']>;
        };
    };
    algorithm?: ThemeAlgorithm | ThemeAlgorithm[];
}
