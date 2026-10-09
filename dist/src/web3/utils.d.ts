/** FNV-1a：字符串 → 32 位无符号整数（确定性，供头像/配色取种子）。 */
export declare function fnvHash(str: string): number;
/** mulberry32：由 seed 产出 [0,1) 确定性伪随机序列（Blockies 逐格取色）。 */
export declare function prng(seed: number): () => number;
/** 截断地址：0x1234abcd…ef56（默认保留头 6 尾 4，含 0x）。 */
export declare function truncateAddress(address: string, lead?: number, trail?: number): string;
/** HSL → #rrggbb。h∈[0,360) s/l∈[0,1]。 */
export declare function hslToHex(h: number, s: number, l: number): string;
export interface Blockies {
    /** 网格边长（格数） */
    size: number;
    /** 前景色（像素块） */
    color: string;
    /** 背景色 */
    bgColor: string;
    /** 稀疏点色（accent） */
    spotColor: string;
    /** size×size 布尔矩阵：true=画前景/点缀，镜像对称（左右翻转，类 Blockies 观感） */
    cells: boolean[][];
    /** size×size 三态：0 背景 / 1 前景 / 2 点缀 */
    shade: number[][];
}
/**
 * 由地址（或任意字符串）确定性生成 8×8 像素身份图案（Ethereum Blockies 风格）。
 * 只取左半 + 镜像到右半 → 左右对称；三档配色由哈希派生。
 */
export declare function blockies(seed: string, size?: number): Blockies;
/** 千分位 + 固定小数位。value 非有限值时返回占位。 */
export declare function formatAmount(value: number, precision?: number): string;
/** 涨跌幅文案：+3.21% / -1.00%，带符号。 */
export declare function formatPercent(value: number, precision?: number): string;
