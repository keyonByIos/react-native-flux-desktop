export type DiffType = 'add' | 'del' | 'ctx' | 'skip';
export interface DiffRow {
    type: DiffType;

    aNum: number | null;

    bNum: number | null;
    text: string;
}

export declare function diffLines(oldText: string, newText: string): DiffRow[];

export declare function foldContext(rows: DiffRow[], context?: number): DiffRow[];

export declare function diffStat(rows: DiffRow[]): {
    added: number;
    removed: number;
};
