"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.available = void 0;
exports.encode = encode;
exports.decode = decode;
exports.inferType = inferType;
exports.matchesType = matchesType;
exports.appDataFolder = appDataFolder;
exports.dataDir = dataDir;
exports.storePath = storePath;
exports.openStore = openStore;
exports.set = set;
exports.get = get;
exports.has = has;
exports.del = del;
exports.keys = keys;
exports.compact = compact;
// db.ts —— 自研 KV 存储的 TS 门面：类型编码/解码 + 双命名存储（app / user）+ 路径解析。
//
// 职责边界：
//   - Rust 侧只认「存储名 → 实体文件 → key→字节」，不关心类型；类型由这里编码进 value 首字节，
//     使文件自描述、且落盘为二进制（非明文）。
//   - 两份独立存储：'app'（系统层，flux_app.kv）与 'user'（用户层，flux_user.kv），各开各的文件。
//   - addon 不可用（纯 tsc / 单测 / 非原生环境）时静默降级：available=false，所有操作 no-op，
//     上层 ConfigStore/UserStore 据此跳过持久化，不影响内存态与抓帧探针。
const path = __importStar(require("path"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lab = (() => {
    try {
        // 与 winit-window.ts 同一入口（编译后 dist/src/app → ../../../index.js = 仓库根 addon）
        return require('../../../index.js');
    }
    catch {
        return null;
    }
})();
/** 原生 KV 是否可用（addon 载入且导出 kvOpen） */
exports.available = !!lab && typeof lab.kvOpen === 'function';
const TYPE_CODE = { bool: 1, num: 2, str: 3, json: 4 };
const CODE_TYPE = ['', 'bool', 'num', 'str', 'json'];
const FILENAMES = { app: 'flux_app.kv', user: 'flux_user.kv' };
/** 按声明类型把 JS 值编码为二进制 blob：[typeByte][payload] */
function encode(type, value) {
    switch (type) {
        case 'bool': {
            const b = Buffer.alloc(2);
            b[0] = TYPE_CODE.bool;
            b[1] = value ? 1 : 0;
            return b;
        }
        case 'num': {
            const b = Buffer.alloc(9);
            b[0] = TYPE_CODE.num;
            b.writeDoubleLE(Number(value), 1);
            return b;
        }
        case 'str': {
            const s = Buffer.from(String(value), 'utf8');
            const b = Buffer.alloc(1 + s.length);
            b[0] = TYPE_CODE.str;
            s.copy(b, 1);
            return b;
        }
        case 'json': {
            const s = Buffer.from(JSON.stringify(value), 'utf8');
            const b = Buffer.alloc(1 + s.length);
            b[0] = TYPE_CODE.json;
            s.copy(b, 1);
            return b;
        }
    }
}
/** 从二进制 blob 解码回 { type, value } */
function decode(buf) {
    const t = buf[0];
    const type = CODE_TYPE[t];
    if (!type)
        throw new Error(`db.decode: 未知类型标记 ${t}`);
    switch (type) {
        case 'bool':
            return { type, value: buf[1] === 1 };
        case 'num':
            return { type, value: buf.readDoubleLE(1) };
        case 'str':
            return { type, value: buf.slice(1).toString('utf8') };
        case 'json':
            return { type, value: JSON.parse(buf.slice(1).toString('utf8')) };
    }
}
/** 推断一个 JS 值应归入的存储类型 */
function inferType(value) {
    if (typeof value === 'boolean')
        return 'bool';
    if (typeof value === 'number')
        return 'num';
    if (typeof value === 'string')
        return 'str';
    return 'json'; // object / null / array
}
/** 值是否匹配声明类型（json 接受任意 object/array/null） */
function matchesType(value, type) {
    switch (type) {
        case 'bool':
            return typeof value === 'boolean';
        case 'num':
            return typeof value === 'number' && Number.isFinite(value);
        case 'str':
            return typeof value === 'string';
        case 'json':
            return value === null || typeof value === 'object';
    }
}
/** 把任意标识清洗成安全目录名（仅留 A-Za-z0-9._-，去前导点线防 '..' 穿越）；空则回退框架名。 */
function appDataFolder() {
    const raw = (process.env.FLUX_APP_DIR || process.env.FLUX_APP_ID || '').trim();
    const clean = raw.replace(/[^0-9A-Za-z._-]+/g, '').replace(/^[._-]+/, '').slice(0, 64);
    return clean || 'react-native-flux';
}
/** 数据目录：env 覆盖 > 打包 %APPDATA%\<应用名> > dev 仓库 src/。
 *  <应用名> 取自 FLUX_APP_DIR（打包启动器按 AppName 透传）/FLUX_APP_ID，按应用隔离，
 *  避免同框架创建多个项目时都撞进写死的 %APPDATA%\react-native-flux。 */
function dataDir() {
    if (process.env.FLUX_DB_DIR)
        return process.env.FLUX_DB_DIR;
    if (process.env.FLUX_PACKAGED === '1') {
        const base = process.env.APPDATA || process.env.HOME || process.cwd();
        return path.join(base, appDataFolder());
    }
    // 开发：落到仓库 src/ 目录（编译后 __dirname = dist/src/app → 上溯三级 = 仓库根，再进 src）
    return path.resolve(__dirname, '..', '..', '..', 'src');
}
function storePath(store) {
    return path.join(dataDir(), FILENAMES[store]);
}
const opened = new Set();
/** 打开命名存储（幂等）。addon 不可用返回 false。 */
function openStore(store) {
    if (!exports.available)
        return false;
    if (opened.has(store))
        return true;
    try {
        lab.kvOpen(store, storePath(store));
        opened.add(store);
        return true;
    }
    catch (e) {
        return false;
    }
}
function set(store, key, type, value) {
    if (!exports.available || !openStore(store))
        return false;
    try {
        lab.kvPut(store, key, encode(type, value));
        return true;
    }
    catch {
        return false;
    }
}
function get(store, key) {
    if (!exports.available || !openStore(store))
        return null;
    try {
        const buf = lab.kvGet(store, key);
        if (!buf || buf.length === 0)
            return null;
        return decode(buf);
    }
    catch {
        return null;
    }
}
function has(store, key) {
    if (!exports.available || !openStore(store))
        return false;
    try {
        return !!lab.kvHas(store, key);
    }
    catch {
        return false;
    }
}
function del(store, key) {
    if (!exports.available || !openStore(store))
        return false;
    try {
        return !!lab.kvDel(store, key);
    }
    catch {
        return false;
    }
}
function keys(store) {
    if (!exports.available || !openStore(store))
        return [];
    try {
        return lab.kvKeys(store);
    }
    catch {
        return [];
    }
}
function compact(store) {
    if (!exports.available || !openStore(store))
        return;
    try {
        lab.kvCompact(store);
    }
    catch {
        /* ignore */
    }
}
