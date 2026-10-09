import React from 'react';
import type { Pt } from './geometry';
/** 折线段：相邻点连成旋转细条。pts 为画布绝对坐标；dash 给定 [实段, 空白] 时沿段长拆子条拼虚线。 */
export declare function Segments(props: {
    pts: Pt[];
    color: string;
    width?: number;
    opacity?: number;
    dash?: [number, number];
}): React.ReactElement;
/** 顶点圆点。 */
export declare function Dots(props: {
    pts: Pt[];
    color: string;
    r?: number;
    opacity?: number;
    bg?: string;
}): React.ReactElement;
