export type TokType = 'comment' | 'string' | 'number' | 'keyword' | 'boolean' | 'func' | 'punct' | 'ident' | 'plain' | 'jsxTag' | 'jsxAttr';
export interface Tok {
    t: string;
    k: TokType;
}

export interface JsxFrame {
    kind: 'tag' | 'expr';
    expectName?: boolean;
    braces?: number;
}

export interface ScanState {
    inBlock: boolean;

    jsxStack?: JsxFrame[];
}

export declare function tokenizeLine(line: string, lang: string, state: ScanState): Tok[];

export declare function tokenize(code: string, lang?: string): Tok[][];
export default tokenize;
