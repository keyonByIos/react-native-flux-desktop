import { SceneNode } from '../scene/node';
import { Radius4 } from '../style/flatten';

export declare function pathRoundRect(ctx: any, x: number, y: number, w: number, h: number, r: Radius4): void;
export declare function setImageReadyNotifier(fn: () => void): void;

export declare function preloadImage(uri: string | undefined | null): void;

export declare function preloadImages(uris: Array<string | undefined | null>): void;

export declare function isImageReady(uri: string | undefined | null): boolean;

export declare function getPaintDpr(): number;

export declare function putCachedCanvas(uri: string, canvas: any): void;

export declare function dropCachedCanvas(uri: string): void;

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

export declare function imagesPending(): boolean;

export declare function getImageGen(): number;

export interface PaintTreeOpts {

    noClear?: boolean;

    band?: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    };
}
export declare function paintTree(ctx: any, root: SceneNode, dpr?: number, opts?: PaintTreeOpts): void;

export declare function createSurface(width: number, height: number, dpr: number): {
    canvas: import("@napi-rs/canvas").Canvas;
    ctx: import("@napi-rs/canvas").SKRSContext2D;
};
