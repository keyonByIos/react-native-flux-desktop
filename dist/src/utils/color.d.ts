
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

export declare function mix(color: string, target: string, p: number): string;
export declare function lighten(color: string, amount: number): string;
export declare function darken(color: string, amount: number): string;

export declare function fade(color: string, alpha: number): string;

export declare function transparentColor(color: string, alpha: number, bg: string): string;
export declare function isValidColor(input: string): boolean;
export declare function readability(bg: string, fg: string): number;

export declare function generate(color: string): string[];
