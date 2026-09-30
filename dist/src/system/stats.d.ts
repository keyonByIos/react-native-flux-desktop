
export interface MemoryUsage {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
}

export interface MemoryUsageMB {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
}

export interface ImageCacheStat {
    count: number;
    bytes: number;
    maxBytes: number;
}

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

export interface SystemSnapshot {
    memory: MemoryUsage;
    memoryMB: MemoryUsageMB;
    imageCache: ImageCacheStat;
    uptimeSec: number;
    windows: WindowMemStat[];
    totalSurfaceMB: number;
    fps: number;
}

export declare class SystemStats {

    memory(): MemoryUsage;

    memoryMB(): MemoryUsageMB;

    imageCache(): ImageCacheStat;

    uptimeSec(): number;

    fps(windowId?: number): number;

    fpsSnapshot(): {
        id: number;
        title: string;
        fps: number;
    }[];

    gcAvailable(): boolean;

    gc(): boolean;

    windows(): WindowMemStat[];
    private _windows;

    snapshot(): SystemSnapshot;

    static fmtMB(bytes: number): string;

    static fmtUptime(sec: number): string;
}

export declare const systemStats: SystemStats;
