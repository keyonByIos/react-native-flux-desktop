import { SceneNode } from '../scene/node';
import { Radius4 } from '../style/flatten';
/** 圆角矩形路径（物理像素坐标也可用，host 滚动 blit 的视口蒙版直接拿 dpr 缩放后的半径进来） */
export declare function pathRoundRect(ctx: any, x: number, y: number, w: number, h: number, r: Radius4): void;
export declare function setImageReadyNotifier(fn: () => void): void;
/**
 * 预加载：提前触发图片解码入缓存，供后续 Image 节点渲染时直接命中，避免首帧留白。
 * 常用于轮播/标签页等「下一屏即将出现」的场景，在当前帧空闲时预热未来资源。
 * 已缓存 / 加载中 / 曾失败的 uri 会被 getImage 内部去重，重复调用无副作用。
 */
export declare function preloadImage(uri: string | undefined | null): void;
/** 批量预加载。 */
export declare function preloadImages(uris: Array<string | undefined | null>): void;
/** 图片是否已解码入缓存（可用于判断能否无留白直接展示）。 */
export declare function isImageReady(uri: string | undefined | null): boolean;
/** 取当前生效的绘制 dpr（离屏 canvas 按设备像素建才不发虚）。首帧 paintTree 前为默认 1。 */
export declare function getPaintDpr(): number;
/** 把一张现画好的 canvas 塞进 customBitmaps，供单个 image 节点（source=合成 key）直接显示；imageGen++ 令含它的位图缓存子树重烘，并请求下一帧。 */
export declare function putCachedCanvas(uri: string, canvas: any): void;
/** 组件卸载时回收合成位图（customBitmaps 不走 LRU，必须显式删）。 */
export declare function dropCachedCanvas(uri: string): void;
/** 图片解码缓存占用（条数 / 估算字节 / 上限字节），供内存面板与帧日志观测 LRU 是否生效。 */
export declare function imageCacheStats(): {
    count: number;
    bytes: number;
    maxBytes: number;
};
export declare function setDefaultTextColor(color: string): void;
export declare function bitmapStats(): {
    bake: number;
    hit: number;
};
/** 图片是否仍在解码中（host 滚动条带缓存据此拒绝增量帧：新图到位必须整帧重画） */
export declare function imagesPending(): boolean;
/** 整树绘制。ctx 需已是逻辑像素坐标系（外部做过 dpr scale）；dpr 供离屏位图缓存按设备分辨率建 */
export interface PaintTreeOpts {
    /** 跳过清屏：在已有底图上补画（滚动条带缓存的新露出条/滚动条列重绘趟） */
    noClear?: boolean;
    /** 初始裁剪带：配合外部 ctx.clip()，剔除只与带相交的子树 */
    band?: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    };
}
export declare function paintTree(ctx: any, root: SceneNode, dpr?: number, opts?: PaintTreeOpts): void;
/** 创建一张 W×H（物理像素）的画布，返回 ctx 且已按 dpr 缩放到逻辑坐标系 */
export declare function createSurface(width: number, height: number, dpr: number): {
    canvas: import("@napi-rs/canvas").Canvas;
    ctx: import("@napi-rs/canvas").SKRSContext2D;
};
