
export declare function tokenize(text: string): string[];
export declare function lineHeightOf(style: Record<string, any>): number;
export interface TextLine {
    text: string;
    width: number;
}
export interface TextLayout {
    lines: TextLine[];
    lineHeight: number;

    maxWidth: number;

    height: number;
    truncated: boolean;
}
export declare function textWidth(ctx: any, text: string): number;

export declare function layoutText(rawText: string, style: Record<string, any>, availWidth?: number, maxLines?: number, preserveSpace?: boolean): TextLayout;

export declare function measureTextBlock(rawText: string, style: Record<string, any>, availWidth: number, widthMode: number, maxLines?: number, preserveSpace?: boolean): {
    width: number;
    height: number;
};

export declare function measureSingleLineWidth(text: string, style: Record<string, any>): number;

export declare function caretIndexAtX(text: string, style: Record<string, any>, x: number): number;

export interface WrappedLine {
    start: number;
    end: number;
    text: string;
    width: number;

    hard: boolean;
}

export declare function wrapText(rawText: string, style: Record<string, any>, availWidth: number): WrappedLine[];
