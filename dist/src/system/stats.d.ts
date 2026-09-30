/** process.memoryUsage() 快照（字节） */
export interface MemoryUsage {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
}
/** 以 MB 为单位的内存快照（便于直接展示） */
export interface MemoryUsageMB {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
}
/** 图片解码缓存快照 */
export interface ImageCacheStat {
    count: number;
    bytes: number;
    maxBytes: number;
}
/** 单窗渲染面统计（heapShareMB 为按节点占比摊算进程 V8 堆的估算值） */
export interface WindowMemStat {
    id: number;
    title: string;
    w: number;
    h: number;
    dpr: number;
    faces: number;
    surfaceMB: number;
    nodes: number;
    heapShareMB: number;
}
/** 一次性系统快照（面板/日志埋点最常用） */
export interface SystemSnapshot {
    memory: MemoryUsage;
    memoryMB: MemoryUsageMB;
    imageCache: ImageCacheStat;
    uptimeSec: number;
    windows: WindowMemStat[];
    totalSurfaceMB: number;
    fps: number;
}
/**
 * 系统运行时取数门面。所有方法均为纯即时快照，可任意频率调用；无副作用（除 gc()）。
 */
export declare class SystemStats {
    /** 进程内存原始字节快照 */
    memory(): MemoryUsage;
    /** 进程内存（MB 单位） */
    memoryMB(): MemoryUsageMB;
    /** 图片解码缓存：张数 / 占用字节 / 上限字节 */
    imageCache(): ImageCacheStat;
    /** 进程运行时长（秒） */
    uptimeSec(): number;
    /** 主窗当前帧率（每秒实际上屏帧数）；传 id 取指定窗。委托 Application.getFps */
    fps(windowId?: number): number;
    /** 逐窗帧率快照（按打开顺序） */
    fpsSnapshot(): {
        id: number;
        title: string;
        fps: number;
    }[];
    /** 是否可调 GC（需 `node --expose-gc` 启动） */
    gcAvailable(): boolean;
    /** 主动触发一次 GC；成功返回 true，无 --expose-gc 时返回 false（不抛） */
    gc(): boolean;
    /**
     * 逐窗渲染面统计：遍历 Application.windows() 取每窗 host 的画布尺寸/dpr/面数/节点数，
     * 并按节点占比把进程 V8 堆摊算到各窗（heapShareMB，共享堆的粗略估算，非精确隔离值）。
     */
    windows(): WindowMemStat[];
    private _windows;
    /** 一次性拉全量快照（一次 memoryUsage 读数贯穿始终，保证内部一致） */
    snapshot(): SystemSnapshot;
    /** 字节 → 「x.x MB」 */
    static fmtMB(bytes: number): string;
    /** 秒 → 「2m44s」/「1h05m」 */
    static fmtUptime(sec: number): string;
}
/** 全局单例：任意处 `import { systemStats } from 'react-native-flux-desktop'` 即可取数。 */
export declare const systemStats: SystemStats;
