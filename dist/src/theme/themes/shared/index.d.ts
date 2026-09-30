import type { AliasToken, MapToken, SeedToken } from '../../interface';
/** A theme is "dark" when its background is darker than its text base. */
export declare const isDarkTheme: (seed: SeedToken) => boolean;
export declare function genColorMapToken(seed: SeedToken): Partial<MapToken>;
/** Font-size & line-height scale. */
export declare function genFontMapToken(seed: SeedToken): Partial<MapToken>;
/** Border-radius scale. */
export declare function genRadius(seed: SeedToken): Partial<MapToken>;
/** Control height scale. */
export declare function genControlHeight(seed: SeedToken): Partial<MapToken>;
/** Border widths & motion durations. */
export declare function genSharedMap(seed: SeedToken): Partial<MapToken>;
/** Spacing / padding / margin scale derived from sizeStep & fontSize. */
export declare function genSizeMapToken(seed: SeedToken): Partial<AliasToken>;
