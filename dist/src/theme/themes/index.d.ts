import type { AliasToken, SeedToken, ThemeAlgorithm } from '../interface';

export declare function buildAliasToken(userToken?: Partial<SeedToken & AliasToken>, algorithm?: ThemeAlgorithm | ThemeAlgorithm[]): AliasToken;
export { defaultSeed } from './seed';
export * from './shared';
