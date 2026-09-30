import type React from 'react';
/** 拖拽项数据：任意形状，由 source 的 getDragData 决定，drop 目标原样收到 */
export type DragData = any;
/** 拖拽结果：落到有效目标 = dropped，其余（落空/取消/拖出窗）= cancelled */
export type DragResult = 'dropped' | 'cancelled';
/** 光标落在放置目标内的半区：上半 = before（插到目标前）、下半 = after（插到目标后） */
export type DropPosition = 'before' | 'after';
/** 拖拽源处理器（useDrag 注册，host 经 id 取用；每次渲染刷新引用以规避闭包过期） */
export interface DragSourceHandlers<T = DragData> {
    /** 起拖时取本次拖拽携带的数据 */
    getDragData: () => T;
    /** 类型标识：与 drop 目标的 type 相符才可落（二者都给了才启用这道过滤） */
    type?: string;
    /** ghost 预览内容；缺省时 DragLayer 画一个通用半透明块 */
    renderImage?: (item: T) => React.ReactNode;
    onDragStart?: (item: T) => void;
    onDragEnd?: (item: T, result: DragResult) => void;
}
/** 放置目标处理器（useDrop 注册） */
export interface DropTargetHandlers<T = DragData> {
    /** 是否接收当前拖拽项；返回 false 则本目标不计入命中（ghost 也不高亮它） */
    canDrop?: (item: T) => boolean;
    onDragEnter?: (item: T, position: DropPosition) => void;
    onDragLeave?: (item: T) => void;
    /** 放下：仅当拖拽项判定可落于此时触发；position = 释放时光标在目标内的半区（上/下半） */
    onDrop?: (item: T, position: DropPosition) => void;
    /** 期望类型：给了则仅同 type 的 source 可落 */
    type?: string;
}
/** 同步预分配一个稳定的拖拽句柄 id（渲染期即分配，effect 里再登记处理器） */
export declare function allocDragId(): number;
export declare function setSource(id: number, h: DragSourceHandlers): void;
export declare function removeSource(id: number): void;
export declare function setTarget(id: number, h: DropTargetHandlers): void;
export declare function removeTarget(id: number): void;
export interface DragState {
    active: boolean;
    /** 跟随光标的窗口逻辑坐标（与 host 鼠标坐标同一空间，同 ContextMenu） */
    x: number;
    y: number;
    /** 当前拖拽项数据 */
    data: DragData;
    /** ghost 渲染函数（来自 source.renderImage）；null = DragLayer 用默认块 */
    image: ((item: DragData) => React.ReactNode) | null;
    /** 当前激活的 source id（无 = null） */
    sourceId: number | null;
    /** 当前命中的可落 drop 目标 id（无 = null）；仅 acceptable 的目标才会被写入 */
    overId: number | null;
    /** 光标在 overId 目标内的半区（上=before / 下=after）；无命中 = null。随光标在行内上下移动实时更新 */
    overPosition: DropPosition | null;
}
/** 快照：引用稳定（仅 notify 前重建），适配 React.useSyncExternalStore */
export declare function getDragState(): DragState;
export declare function subscribeDrag(l: () => void): () => void;
export declare function isDragging(): boolean;
/**
 * 起拖：读 source 数据 + 预览函数，置 active，回调 onDragStart。
 * 由 host 在「按下后移动越过阈值」时调用（短按不起拖）。
 */
export declare function beginDrag(sourceId: number, x: number, y: number): void;
/**
 * 移动：更新坐标与半区；overId 变化时对旧目标派发 leave、对新（且可落）目标派发 enter。
 * 命中但不可落的目标被归一为 null（不高亮、不误派发 enter）。
 * position 随光标在同一目标内上下半移动而变（不重发 enter，仅更新 overPosition 供落点线跟随）。
 */
export declare function moveDrag(x: number, y: number, overId: number | null, position?: DropPosition): void;
/** 释放：命中可落目标 → 派发 onDrop + source.onDragEnd('dropped')；否则 'cancelled' */
export declare function dropDrag(): void;
/** 取消：拖出窗口 / 失焦等异常终止，派发 leave + source.onDragEnd('cancelled') */
export declare function cancelDrag(): void;
