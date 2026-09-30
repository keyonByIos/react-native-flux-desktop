
export declare const available: boolean;

export type ValueType = 'bool' | 'num' | 'str' | 'json';

export type StoreName = 'app' | 'user';

export declare function encode(type: ValueType, value: unknown): Buffer;

export declare function decode(buf: Buffer): {
    type: ValueType;
    value: unknown;
};

export declare function inferType(value: unknown): ValueType;

export declare function matchesType(value: unknown, type: ValueType): boolean;

export declare function appDataFolder(): string;

export declare function dataDir(): string;
export declare function storePath(store: StoreName): string;

export declare function openStore(store: StoreName): boolean;
export declare function set(store: StoreName, key: string, type: ValueType, value: unknown): boolean;
export declare function get(store: StoreName, key: string): {
    type: ValueType;
    value: unknown;
} | null;
export declare function has(store: StoreName, key: string): boolean;
export declare function del(store: StoreName, key: string): boolean;
export declare function keys(store: StoreName): string[];
export declare function compact(store: StoreName): void;
