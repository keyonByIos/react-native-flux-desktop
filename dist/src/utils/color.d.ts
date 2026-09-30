/**
 * Lightweight color utility (no external deps).
 * Supports hex / rgb(a) / hsl(a) parsing and the operations used by the theme
 * derivation algorithm: darken/lighten mix, alpha compositing and palette gen.
 */
export interface RGB {
    r: number;
    g: number;
    b: number;
}
export interface HSL extends RGB {
    h: number;
    s: number;
    l: number;
}
export declare function parse(input: string): RGB;
export declare function rgbToHex({ r, g, b }: RGB): string;
export declare function rgbToHsv(rgb: RGB): {
    h: number;
    s: number;
    v: number;
};
export declare function hsvToRgb(h: number, s: number, v: number): RGB;
/** Mix `color` toward `target` by `p` (0..1). Equivalent to less mix(). */
export declare function mix(color: string, target: string, p: number): string;
export declare function lighten(color: string, amount: number): string;
export declare function darken(color: string, amount: number): string;
/** Return an rgba() string with the given alpha. */
export declare function fade(color: string, alpha: number): string;
/** Composite a translucent foreground over an opaque background. */
export declare function transparentColor(color: string, alpha: number, bg: string): string;
export declare function isValidColor(input: string): boolean;
export declare function readability(bg: string, fg: string): number;
/**
 * Generate a 10-level palette (index 0 => level 1 ... index 9 => level 10),
 * mirroring Ant Design's @ant-design/colors algorithm (HSV-based tint/shade).
 */
export declare function generate(color: string): string[];
