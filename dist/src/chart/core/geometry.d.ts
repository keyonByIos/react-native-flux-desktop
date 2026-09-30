export type Pt = [number, number];

export declare function polar(cx: number, cy: number, r: number, deg: number): Pt;

export declare function sectorPath(cx: number, cy: number, r0: number, r1: number, a0: number, sweep: number): string;

export declare function arcPath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string;

export declare function polygonPath(pts: Pt[]): string;

export declare function polylineLength(pts: Pt[]): number;

export declare function catmullRom(pts: Pt[], samples?: number): Pt[];

export declare function truncatePolyline(pts: Pt[], t: number): Pt[];

export declare function sectorHitBoxes(cx: number, cy: number, r0: number, r1: number, a0: number, sweep: number, steps?: number): Array<{
    left: number;
    top: number;
    width: number;
    height: number;
}>;

export declare function sampleYAtX(pts: Pt[], x: number): number | null;
