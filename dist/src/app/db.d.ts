/** 原生 KV 是否可用（addon 载入且导出 kvOpen） */
export declare const available: boolean;
/** 值类型（存进文件首字节的类型标记） */
export type ValueType = 'bool' | 'num' | 'str' | 'json';
/** 存储名（= Rust 侧 store key） */
export type StoreName = 'app' | 'user';
/** 按声明类型把 JS 值编码为二进制 blob：[typeByte][payload] */
export declare function encode(type: ValueType, value: unknown): Buffer;
/** 从二进制 blob 解码回 { type, value } */
export declare function decode(buf: Buffer): {
    type: ValueType;
    value: unknown;
};
/** 推断一个 JS 值应归入的存储类型 */
export declare function inferType(value: unknown): ValueType;
/** 值是否匹配声明类型（json 接受任意 object/array/null） */
export declare function matchesType(value: unknown, type: ValueType): boolean;
/** 把任意标识清洗成安全目录名（仅留 A-Za-z0-9._-，去前导点线防 '..' 穿越）；空则回退框架名。 */
export declare function appDataFolder(): string;
/** 数据目录：env 覆盖 > 打包 %APPDATA%\<应用名> > dev 仓库 src/。
 *  <应用名> 取自 FLUX_APP_DIR（打包启动器按 AppName 透传）/FLUX_APP_ID，按应用隔离，
 *  避免同框架创建多个项目时都撞进写死的 %APPDATA%\react-native-flux。 */
export declare function dataDir(): string;
export declare function storePath(store: StoreName): string;
/** 打开命名存储（幂等）。addon 不可用返回 false。 */
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
