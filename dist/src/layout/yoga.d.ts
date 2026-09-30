export type MeasureFunc = (width: number, widthMode: number, height: number, heightMode: number) => {
    width: number;
    height: number;
};

export declare function initYoga(): Promise<void>;
export declare function isYogaReady(): boolean;
export declare function createYogaNode(): any;
export declare function freeYogaNode(node: any): void;

export declare function applyStyleToNode(node: any, s: Record<string, any>): void;

export declare function setMeasureFunc(node: any, fn: MeasureFunc): void;

export declare function markDirty(node: any): void;
export declare function unsetMeasureFunc(node: any): void;

export declare const MeasureMode: {
    Undefined: any;
    Exactly: any;
    AtMost: any;
};
export declare const DirectionLTR: any;

export declare function calculateLayout(root: any, width: number, height: number): void;
