export interface TreemapRect {
    x: number;
    y: number;
    w: number;
    h: number;

    index: number;
}

export declare function squarify(values: number[], x: number, y: number, w: number, h: number): TreemapRect[];
