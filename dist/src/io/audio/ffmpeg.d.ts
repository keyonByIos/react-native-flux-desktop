/** 解析出可用的 ffmpeg 命令路径（FLUX_FFMPEG_PATH → ffmpeg-static 包 → PATH 上的 ffmpeg）；不可用返回 null。 */
export declare function resolveFfmpeg(): string | null;
/** ffmpeg 是否可用（用于 UI 决定是否提示降级）。 */
export declare function isFfmpegAvailable(): boolean;
export interface PeaksResult {
    /** 归一化振幅 0..1，长度 = buckets（个别桶可能为 0） */
    peaks: number[];
    /** 解码来源，便于 UI 标注 / 调试 */
    via: 'wav' | 'ffmpeg';
}
/**
 * 计算波形 peaks。优先纯 Node 解 WAV（无外部依赖）；非 WAV 则走 ffmpeg（不可用返回 null）。
 * @param src 本地绝对路径或 http(s) URL
 * @param buckets 竖条数量（≈波形像素宽 / 间距），默认 400
 */
export declare function computePeaks(src: string, buckets?: number): Promise<PeaksResult | null>;
