import React from 'react';
import { type DragData, type DragResult, type DropPosition } from '../../window/drag';
/** useDrag 入参 */
export interface UseDragOptions<T = DragData> {
    /** 起拖时取本次拖拽携带的数据 */
    getDragData: () => T;
    /** 类型标识：与 useDrop 的 type 相符才可落 */
    type?: string;
    /** ghost 预览内容；缺省时 DragLayer 画一个通用半透明块 */
    renderImage?: (item: T) => React.ReactNode;
    onDragStart?: (item: T) => void;
    onDragEnd?: (item: T, result: DragResult) => void;
}
/** useDrop 入参 */
export interface UseDropOptions<T = DragData> {
    /** 是否接收当前拖拽项 */
    canDrop?: (item: T) => boolean;
    onDragEnter?: (item: T, position: DropPosition) => void;
    onDragLeave?: (item: T) => void;
    /** 放下：position = 释放时光标在本目标内的半区（上半 before / 下半 after） */
    onDrop?: (item: T, position: DropPosition) => void;
    /** 期望类型：仅同 type 的 source 可落 */
    type?: string;
}
/** 拖拽源的标记 props（spread 到 <View>） */
export interface DragBindProps {
    __drag: {
        id: number;
    };
}
/** 放置目标的标记 props（spread 到 <View>） */
export interface DropBindProps {
    __drop: {
        id: number;
    };
}
/**
 * 声明一个拖拽源。返回 [bind, { isDragging }]：
 *   bind spread 到要能拖起的 <View>；isDragging 表示本项此刻正被拖。
 * 短按（未越位移阈值）仍是普通点击，不触发拖拽。
 */
export declare function useDrag<T = DragData>(options: UseDragOptions<T>): [DragBindProps, {
    isDragging: boolean;
}];
/**
 * 声明一个放置目标。返回 [bind, { isOver, position }]：
 *   bind spread 到要能接收拖放的 <View>；isOver 表示「正有可落项悬停于此」（已含类型/canDrop 判定）；
 *   position 为光标在本目标内的半区（上半 'before' / 下半 'after'），未悬停时 null——供实时绘制插入位置线。
 */
export declare function useDrop<T = DragData>(options?: UseDropOptions<T>): [DropBindProps, {
    isOver: boolean;
    position: DropPosition | null;
}];
/**
 * 拖拽预览浮层：挂 Window 根，订阅总线渲染跟随光标的 ghost（半透明，pointerEvents=none 穿透）。
 * zIndex 1090（高于右键菜单 1070 / message 1080 之下不冲突，始终盖在正文上）。
 */
export declare function DragLayer(): React.ReactElement | null;
export default DragLayer;
