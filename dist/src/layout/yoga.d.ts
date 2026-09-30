export type MeasureFunc = (width: number, widthMode: number, height: number, heightMode: number) => {
    width: number;
    height: number;
};
/** 加载 WASM 版 Yoga；进程内只需一次 */
export declare function initYoga(): Promise<void>;
export declare function isYogaReady(): boolean;
export declare function createYogaNode(): any;
export declare function freeYogaNode(node: any): void;
/**
 * 把 RN style 应用到 Yoga 节点。
 * 默认值与 RN 一致：flexDirection=column、alignItems=stretch、flexShrink=1。
 * （RN 的 flexShrink 默认是 1，和 Web 的 0 相反——不显式设会导致内容被压缩行为不一致。）
 */
export declare function applyStyleToNode(node: any, s: Record<string, any>): void;
/** 文本节点测量回调：由 Painter 提供字体度量，Yoga 在布局时回调 */
export declare function setMeasureFunc(node: any, fn: MeasureFunc): void;
/**
 * 标脏：强制 Yoga 下次 calculateLayout 重新调用 measureFunc。
 * 文本内容变化后必须标脏，否则 Yoga 沿用缓存的旧测量宽度，
 * 变长的末尾字符会被 overflow:hidden 裁掉（表现为「打字落后一帧」）。
 */
export declare function markDirty(node: any): void;
export declare function unsetMeasureFunc(node: any): void;
/** MeasureMode 枚举值（回调里判断父级给的约束类型） */
export declare const MeasureMode: {
    Undefined: any;
    Exactly: any;
    AtMost: any;
};
export declare const DirectionLTR: any;
/** 计算整棵树布局 */
export declare function calculateLayout(root: any, width: number, height: number): void;
