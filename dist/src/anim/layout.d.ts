import React from 'react';
import { StyleProp, ViewStyle, TransformArray } from '../types';
import { type Easing } from './easing';
export interface FlipOptions {
    duration?: number;
    /** 传入 spring() 结果可让 FLIP 带过冲回弹 */
    easing?: Easing;
}
/**
 * 测量宿主盒绝对位置，检测跳变并产出「反演→恒等」的补间 transform。
 * 用法：把 onLayoutAbs 挂到元素上、transform + transformOrigin:'0 0' 塞进 style。
 */
export declare function useFlip(options?: FlipOptions): {
    onLayoutAbs: (e: any) => void;
    transform: TransformArray;
};
export interface FlipProps extends FlipOptions {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
/**
 * 声明式 FLIP 容器：包一层 View，自动测盒 + 反演补间。
 * transformOrigin 固定 '0 0'（左上角），使缩放把「旧盒」精确套到「新盒」上（左对齐、按比例）；
 * 纯位移场景（尺寸不变）缩放分量恒为 1，不会拉伸子内容。
 */
export declare function Flip(props: FlipProps): React.ReactElement;
