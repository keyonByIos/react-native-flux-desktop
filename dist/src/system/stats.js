"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemStats = exports.SystemStats = void 0;
// SystemStats：系统运行时数据的统一取数门面（把「内存监控面板」的取数逻辑抽成可随时调用的类）。
// 聚合进程内存 / 图片解码缓存 / 运行时长 / 逐窗渲染面 / 帧率 / GC，全部为「即时快照」语义
// （每次调用现取当前值，无内部定时器），供任意处 import { systemStats } 直接调用或自建面板。
// 与 MemMonitor 组件共享同一数据源：MemMonitor 亦改为消费本类，避免取数逻辑两处漂移。
const painter_1 = require("../paint/painter");
const app_1 = require("../app");
const MB = 1024 * 1024;
/**
 * 系统运行时取数门面。所有方法均为纯即时快照，可任意频率调用；无副作用（除 gc()）。
 */
class SystemStats {
    /** 进程内存原始字节快照 */
    memory() {
        const u = process.memoryUsage();
        return {
            rss: u.rss,
            heapUsed: u.heapUsed,
            heapTotal: u.heapTotal,
            external: u.external,
            arrayBuffers: u.arrayBuffers || 0,
        };
    }
    /** 进程内存（MB 单位） */
    memoryMB() {
        const m = this.memory();
        return {
            rss: m.rss / MB,
            heapUsed: m.heapUsed / MB,
            heapTotal: m.heapTotal / MB,
            external: m.external / MB,
            arrayBuffers: m.arrayBuffers / MB,
        };
    }
    /** 图片解码缓存：张数 / 占用字节 / 上限字节 */
    imageCache() {
        return (0, painter_1.imageCacheStats)();
    }
    /** 进程运行时长（秒） */
    uptimeSec() {
        return process.uptime();
    }
    /** 主窗当前帧率（每秒实际上屏帧数）；传 id 取指定窗。委托 Application.getFps */
    fps(windowId) {
        return app_1.Application.getFps(windowId);
    }
    /** 逐窗帧率快照（按打开顺序） */
    fpsSnapshot() {
        return app_1.Application.fpsSnapshot();
    }
    /** 是否可调 GC（需 `node --expose-gc` 启动） */
    gcAvailable() {
        return typeof globalThis.gc === 'function';
    }
    /** 主动触发一次 GC；成功返回 true，无 --expose-gc 时返回 false（不抛） */
    gc() {
        if (this.gcAvailable()) {
            globalThis.gc();
            return true;
        }
        return false;
    }
    /**
     * 逐窗渲染面统计：遍历 Application.windows() 取每窗 host 的画布尺寸/dpr/面数/节点数，
     * 并按节点占比把进程 V8 堆摊算到各窗（heapShareMB，共享堆的粗略估算，非精确隔离值）。
     */
    windows() {
        return this._windows(this.memoryMB().heapUsed);
    }
    _windows(heapMB) {
        const stats = [];
        for (const r of app_1.Application.windows()) {
            const g = r.host && typeof r.host.getMemStats === 'function' ? r.host.getMemStats() : null;
            if (!g)
                continue;
            stats.push({ id: r.id, title: r.title || `窗 ${r.id}`, ...g, heapShareMB: 0 });
        }
        const totalNodes = stats.reduce((a, s) => a + s.nodes, 0) || 1;
        for (const s of stats)
            s.heapShareMB = (heapMB * s.nodes) / totalNodes;
        return stats;
    }
    /** 一次性拉全量快照（一次 memoryUsage 读数贯穿始终，保证内部一致） */
    snapshot() {
        const memory = this.memory();
        const memoryMB = {
            rss: memory.rss / MB,
            heapUsed: memory.heapUsed / MB,
            heapTotal: memory.heapTotal / MB,
            external: memory.external / MB,
            arrayBuffers: memory.arrayBuffers / MB,
        };
        const windows = this._windows(memoryMB.heapUsed);
        return {
            memory,
            memoryMB,
            imageCache: this.imageCache(),
            uptimeSec: this.uptimeSec(),
            windows,
            totalSurfaceMB: windows.reduce((a, w) => a + w.surfaceMB, 0),
            fps: this.fps(),
        };
    }
    // ---- 格式化辅助（静态纯函数，供调用方直接复用） ----
    /** 字节 → 「x.x MB」 */
    static fmtMB(bytes) {
        return (bytes / MB).toFixed(1) + ' MB';
    }
    /** 秒 → 「2m44s」/「1h05m」 */
    static fmtUptime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}m` : `${m}m${String(s).padStart(2, '0')}s`;
    }
}
exports.SystemStats = SystemStats;
/** 全局单例：任意处 `import { systemStats } from 'react-native-flux-desktop'` 即可取数。 */
exports.systemStats = new SystemStats();
