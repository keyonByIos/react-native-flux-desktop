
export declare function fnvHash(str: string): number;

export declare function prng(seed: number): () => number;

export declare function truncateAddress(address: string, lead?: number, trail?: number): string;

export declare function hslToHex(h: number, s: number, l: number): string;
export interface Blockies {

    size: number;

    color: string;

    bgColor: string;

    spotColor: string;

    cells: boolean[][];

    shade: number[][];
}

export declare function blockies(seed: string, size?: number): Blockies;

export declare function formatAmount(value: number, precision?: number): string;

export declare function formatPercent(value: number, precision?: number): string;
