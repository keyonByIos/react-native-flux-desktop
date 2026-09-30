/**
 * Gpu2DProxy：与 CanvasRenderingContext2D 接口对齐，内部转发 GpuCtx2D。
 * 用法：const ctx = new Gpu2DProxy(winId); paintTree(ctx, root, dpr); ctx.flush();
 */
export declare class Gpu2DProxy {
    /** painter 据此判断走 GPU 分支（图标层直传 SVG path data 字符串，不建 Path2D）。 */
    readonly __gpu = true;
    private _gpu;
    private _dpr;
    private _fontStr;
    private _baseline;
    constructor(winId: number);
    set fillStyle(v: string);
    get fillStyle(): string;
    set strokeStyle(v: string);
    get strokeStyle(): string;
    set lineWidth(v: number);
    get lineWidth(): number;
    set globalAlpha(v: number);
    get globalAlpha(): number;
    set lineCap(v: string);
    get lineCap(): string;
    set lineJoin(v: string);
    get lineJoin(): string;
    set font(v: string);
    get font(): string;
    set textBaseline(v: string);
    get textBaseline(): string;
    set textAlign(_v: string);
    get textAlign(): string;
    setLineDash(segments: number[]): void;
    save(): void;
    restore(): void;
    translate(x: number, y: number): void;
    scale(sx: number, sy: number): void;
    rotate(angle: number): void;
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    resetTransform(): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    clearRect(x: number, y: number, w: number, h: number): void;
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void;
    arc(x: number, y: number, r: number, start: number, end: number, ccw?: boolean): void;
    quadraticCurveTo(cx: number, cy: number, x: number, y: number): void;
    bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void;
    closePath(): void;
    fill(path?: unknown, rule?: string): void;
    stroke(path?: unknown): void;
    clip(): void;
    fillText(text: string, x: number, y: number): void;
    strokeText(text: string, x: number, y: number): void;
    measureText(text: string): {
        width: number;
    };
    /** drawImage 兼容 Canvas2D 签名：接受 @napi-rs/canvas Image/Canvas 对象。 */
    drawImage(img: any, dx: number, dy: number, dw?: number, dh?: number): void;
    /** GPU flush：提交绘制命令 + swap_buffers 直呈。 */
    flush(): void;
    /** 清屏（背景色 RGBA 0-255）。 */
    clearAll(r: number, g: number, b: number, a: number): void;
    /** 设置 dpr 缩放（paintTree 入口通常用 setTransform(dpr,0,0,dpr,0,0)）。 */
    setDpr(dpr: number): void;
}
/** 检测 GPU 模式是否可用 */
export declare function gpuAvailable(): boolean;
