import type { AliasToken } from './alias';
import type { SeedToken } from './seed';
import type { ComponentTokenMap } from './components';
/** Theme derivation algorithm. */
export type ThemeAlgorithm = 'default' | 'dark' | 'compact';
/**
 * User-facing theme configuration passed to <FluxProvider theme={...} />.
 * - `token`        : override any Seed/Alias token globally.
 * - `components`   : override per-component tokens.
 * - `algorithm`    : pick built-in derivations. Pass an array to compose
 *   overlapping properties (e.g. `['dark', 'compact']` = dark + dense).
 */
export interface ThemeConfig {
    token?: Partial<SeedToken> & Partial<AliasToken>;
    components?: {
        [K in keyof ComponentTokenMap]?: {
            token?: Partial<ComponentTokenMap[K]['token']>;
        };
    };
    algorithm?: ThemeAlgorithm | ThemeAlgorithm[];
}
