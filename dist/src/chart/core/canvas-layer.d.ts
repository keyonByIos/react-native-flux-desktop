import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
/** 绘制回调：ctx 已按 dpr setTransform，直接用逻辑像素坐标画；w/h 为逻辑尺寸，dpr 为超采样倍率。 */
export type DrawFn = (ctx: any, w: number, h: number, dpr: number) => void;
export interface CanvasLayerProps {
    /** 逻辑宽（= 显示宽，Image 以此为布局盒） */
    width: number;
    /** 逻辑高 */
    height: number;
    /** 绘制内容；每次 deps 变化时用最新闭包重跑 */
    draw: DrawFn;
    /** 重绘依赖：等价 useEffect 依赖数组。凡 draw 读到的外部值都要列进来。 */
    deps: React.DependencyList;
    /** 叠加在绝对定位 Image 上的样式（如 marginTop） */
    style?: StyleProp<ViewStyle>;
}
/**
 * 离屏位图承载层：单节点显示一张自绘 canvas。
 * dpr 取 max(2, 当前 paintDpr)：静态图首帧 paintDpr 未定时也 ≥2× 避免发虚；dpr=2 屏精确 1:1。
 */
export declare function CanvasLayer(props: CanvasLayerProps): React.ReactElement;
export default CanvasLayer;
