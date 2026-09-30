
export declare class Gpu2DProxy {

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

    drawImage(img: any, dx: number, dy: number, dw?: number, dh?: number): void;

    flush(): void;

    clearAll(r: number, g: number, b: number, a: number): void;

    setDpr(dpr: number): void;
}

export declare function gpuAvailable(): boolean;
