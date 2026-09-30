import { StyleProp, ViewStyle } from '../types';
export type FlatStyle = Record<string, any>;

export declare function flattenStyle(prop: StyleProp<any>): FlatStyle;

export declare function parseDim(v: unknown): {
    value: number;
    percent: boolean;
} | null;
export declare function toNumber(v: unknown, fallback?: number): number;

export declare function expandShorthands(style: FlatStyle): FlatStyle;
export type Radius4 = {
    tl: number;
    tr: number;
    br: number;
    bl: number;
};

export declare function getRadius(s: FlatStyle): Radius4;
export type Edges4 = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

export declare function getBorderWidths(s: FlatStyle): Edges4;

export declare function getBorderColors(s: FlatStyle): {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
};

export declare function normalizeStyle(prop: StyleProp<ViewStyle>): FlatStyle;
export type Matrix = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
};

export declare function parseTransform(s: FlatStyle, w: number, h: number, boxX: number, boxY: number): Matrix | null;
