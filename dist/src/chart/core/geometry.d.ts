export type Pt = [number, number];
/** 极坐标：deg 以 12 点为 0，顺时针增长。 */
export declare function polar(cx: number, cy: number, r: number, deg: number): Pt;
/** 实心 / 环形扇区（fill）：从 a0 顺时针扫 sweep；r0<=0 为实心饼块。 */
export declare function sectorPath(cx: number, cy: number, r0: number, r1: number, a0: number, sweep: number): string;
/** 圆弧描边（stroke）：从 startDeg 顺时针扫 sweepDeg；sweep<=0 返回空串。 */
export declare function arcPath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string;
/** 闭合多边形路径（radar 面）：点序列首尾相连。 */
export declare function polygonPath(pts: Pt[]): string;
/** 折线总长。 */
export declare function polylineLength(pts: Pt[]): number;
/**
 * Catmull-Rom 平滑：把折线点列稠密化成过每个原点的光滑曲线（供 Segments / 面积薄片采样）。
 * <3 点无从弯曲，原样返回。samples 为每段采样数（越大越平滑、View 越多）。端点用「复制首/末点」补邻。
 * 注：均匀 Catmull-Rom 在剧烈起伏处可能轻微过冲（本管线无 monotone 约束），常规数据无碍。
 */
export declare function catmullRom(pts: Pt[], samples?: number): Pt[];
/**
 * 按总长比例 t（0..1）截断折线——入场「自左向右描线」的核心。
 * 返回截断后的点列，末段按比例插入插值点。
 */
export declare function truncatePolyline(pts: Pt[], t: number): Pt[];
/**
 * 扇区命中盒：把 [a0, a0+sweep]×[r0, r1] 的扇环按角度细分成若干小梯形，各取内接轴对齐矩形。
 * 管线 hover 命中只认矩形（无 path 命中测试），直接用整块扇区包围盒会越界误伤邻扇区；
 * 逐段细分后矩形都落在扇区内，精度随 steps 提高（3° 一格足够细腻）。返回 {left,top,width,height} 列表。
 */
export declare function sectorHitBoxes(cx: number, cy: number, r0: number, r1: number, a0: number, sweep: number, steps?: number): Array<{
    left: number;
    top: number;
    width: number;
    height: number;
}>;
/** 在点列上按 x 线性插值取 y（面积填充沿 x 采样用）；pts 已按 x 升序。 */
export declare function sampleYAtX(pts: Pt[], x: number): number | null;
