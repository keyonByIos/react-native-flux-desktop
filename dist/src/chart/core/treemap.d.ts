export interface TreemapRect {
    x: number;
    y: number;
    w: number;
    h: number;
    /** 对应输入 values 的下标 */
    index: number;
}
/**
 * 把 values（正权重）铺进盒 (x,y,w,h)，返回等长矩形数组（0/负值项被跳过，不出现在结果里）。
 * 结果面积 ∝ 值；总面积 = 盒面积（无空隙）。
 */
export declare function squarify(values: number[], x: number, y: number, w: number, h: number): TreemapRect[];
