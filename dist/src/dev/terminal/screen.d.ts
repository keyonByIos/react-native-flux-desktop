
export declare function isWide(ch: string): boolean;

export interface Cell {
    ch: string;
    fg: string | null;
    bg: string | null;
    bold: boolean;
    ul: boolean;
}

export declare class Screen {
    readonly cols: number;
    readonly rows: number;
    cx: number;
    cy: number;
    private grid;
    private scrollback;
    private readonly maxScrollback;
    private savedCx;
    private savedCy;
    private pen;
    constructor(cols: number, rows: number);
    feed(chunk: string): void;

    private putc;
    private blank;
    private lineFeed;
    private scrollUp;

    private parseEscape;

    private parseCSI;

    private applySGR;
    private eraseLine;
    private eraseDisplay;

    screenLines(): Cell[][];

    view(): {
        lines: Cell[][];
        cursorRow: number;
        cursorCol: number;
    };
}

export declare function rowText(row: Cell[]): string;
export default Screen;
