import type { AliasToken, MapToken, SeedToken } from '../../interface';

export declare const isDarkTheme: (seed: SeedToken) => boolean;
export declare function genColorMapToken(seed: SeedToken): Partial<MapToken>;

export declare function genFontMapToken(seed: SeedToken): Partial<MapToken>;

export declare function genRadius(seed: SeedToken): Partial<MapToken>;

export declare function genControlHeight(seed: SeedToken): Partial<MapToken>;

export declare function genSharedMap(seed: SeedToken): Partial<MapToken>;

export declare function genSizeMapToken(seed: SeedToken): Partial<AliasToken>;
