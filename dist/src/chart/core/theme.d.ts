import type { AliasToken } from '../../theme/interface';
/** 默认分类色板（AntV G2 lineage — 跨主题和谐）。 */
export declare const DEFAULT_PALETTE: string[];
export interface ChartTheme {
    /** 坐标轴 / 基线实色 */
    axisLine: string;
    /** 网格线（淡色） */
    gridLine: string;
    /** 刻度与类目标签色 */
    label: string;
    /** 标签字号 */
    labelSize: number;
    /** 字体族 */
    fontFamily: string;
    /** 分类序列色板 */
    palette: string[];
    /** 品牌主色（单序列默认色） */
    primary: string;
    /** 序列填充/面积渐变的底色（透明叠加用） */
    fillTrack: string;
    /** 悬浮提示卡底色（恒为沉浸式暗泡，不随主题翻白） */
    tooltipBg: string;
    /** tooltip 内文字色（与暗泡恒对比） */
    tooltipText: string;
    /** 高对比「墨色」：内嵌箱/须/均值、单元格高亮描边、目标标记等需要与彩色填充对比处 */
    ink: string;
}
export declare function buildChartTheme(token: AliasToken): ChartTheme;
/** 给 `#RRGGBB` 追加/替换 2 位十六进制 alpha；其它格式原样返回。 */
export declare function withAlpha(hex: string, aa: string): string;
/** 解析 `#RGB` / `#RRGGBB` 为 `[r,g,b]`；其它返回 null。 */
export declare function parseHex(hex: string): [number, number, number] | null;
/** 向白色混合 `t`（0..1）——柱/面顶部提亮用。 */
export declare function lighten(hex: string, t: number): string;
/** 取序列 `i` 的颜色，尊重覆盖（单色串 / 色板数组）。 */
export declare function seriesColor(i: number, override: string | string[] | undefined, theme: ChartTheme): string;
