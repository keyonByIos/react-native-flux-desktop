export interface PickFilesOptions {

    multiple?: boolean;

    accept?: string[];

    title?: string;
}

export declare function pickFiles(opts?: PickFilesOptions): string[];
export interface SaveFileOptions {

    accept?: string[];

    title?: string;

    defaultName?: string;

    defaultDir?: string;
}

export declare function saveFile(opts?: SaveFileOptions): string;
