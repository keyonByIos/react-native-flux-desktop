import type { AliasToken, SeedToken, ThemeAlgorithm } from '../interface';
/** Compose a complete AliasToken from user seed overrides + one or more algorithms. */
export declare function buildAliasToken(userToken?: Partial<SeedToken & AliasToken>, algorithm?: ThemeAlgorithm | ThemeAlgorithm[]): AliasToken;
export { defaultSeed } from './seed';
export * from './shared';
