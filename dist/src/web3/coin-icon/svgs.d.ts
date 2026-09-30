
export interface CoinLayer {
    d: string;
    fill: string;
    tx?: number;
    ty?: number;
}

export interface CoinDef {
    vb: number;
    layers: CoinLayer[];
}

export declare const COINS: Record<string, CoinDef>;

export declare const COIN_ALIASES: Record<string, string>;

export declare const COIN_IDS: string[];

export declare function getCoinDef(symbol: string): CoinDef | undefined;
