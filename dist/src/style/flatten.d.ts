import { StyleProp, ViewStyle } from '../types';
export type FlatStyle = Record<string, any>;
/** 把 StyleProp（对象/数组/false/null）递归合并成一个平面对象，后者覆盖前者 */
export declare function flattenStyle(prop: StyleProp<any>): FlatStyle;
/** 数值或百分比字符串 → { value, unit }；'auto'/undefined → null */
export declare function parseDim(v: unknown): {
    value: number;
    percent: boolean;
} | null;
export declare function toNumber(v: unknown, fallback?: number): number;
/** 展开 padding/margin 的 all / Horizontal / Vertical 三级简写 */
export declare function expandShorthands(style: FlatStyle): FlatStyle;
export type Radius4 = {
    tl: number;
    tr: number;
    br: number;
    bl: number;
};
/** 圆角归一：支持 number 与 {topLeft,...} 对象两种 RN 写法 */
export declare function getRadius(s: FlatStyle): Radius4;
export type Edges4 = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
/** 边框宽度归一：borderWidth 为基准，单边可覆盖 */
export declare function getBorderWidths(s: FlatStyle): Edges4;
/** 边框颜色归一：borderColor 为基准，单边可覆盖（Card 头尾分隔线就靠这个） */
export declare function getBorderColors(s: FlatStyle): {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
};
/** 完整归一化入口：flatten → 展开简写 */
export declare function normalizeStyle(prop: StyleProp<ViewStyle>): FlatStyle;
export type Matrix = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
};
/**
 * 把 style.transform 解析成作用于绝对坐标系的最终矩阵。
 * 无 transform / 单位变换返回 null（painter 走快速路径，零开销）。
 */
export declare function parseTransform(s: FlatStyle, w: number, h: number, boxX: number, boxY: number): Matrix | null;
