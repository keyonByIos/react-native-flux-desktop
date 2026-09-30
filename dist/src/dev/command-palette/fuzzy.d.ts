export interface FuzzyResult {

    score: number;

    indices: number[];
}

export declare function fuzzyMatch(query: string, target: string): FuzzyResult | null;

export declare function rankItems<T>(query: string, items: T[], textOf: (item: T) => string): {
    item: T;
    score: number;
    indices: number[];
}[];
