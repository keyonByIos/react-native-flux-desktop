
export declare function resolveFfmpeg(): string | null;

export declare function isFfmpegAvailable(): boolean;
export interface PeaksResult {

    peaks: number[];

    via: 'wav' | 'ffmpeg';
}

export declare function computePeaks(src: string, buckets?: number): Promise<PeaksResult | null>;
