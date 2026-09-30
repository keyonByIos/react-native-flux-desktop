import type { AliasToken } from '../../theme/interface';

export declare const DEFAULT_PALETTE: string[];
export interface ChartTheme {

    axisLine: string;

    gridLine: string;

    label: string;

    labelSize: number;

    fontFamily: string;

    palette: string[];

    primary: string;

    fillTrack: string;

    tooltipBg: string;

    tooltipText: string;

    ink: string;
}
export declare function buildChartTheme(token: AliasToken): ChartTheme;

export declare function withAlpha(hex: string, aa: string): string;

export declare function parseHex(hex: string): [number, number, number] | null;

export declare function lighten(hex: string, t: number): string;

export declare function seriesColor(i: number, override: string | string[] | undefined, theme: ChartTheme): string;
