import type React from 'react';

export type DragData = any;

export type DragResult = 'dropped' | 'cancelled';

export type DropPosition = 'before' | 'after';

export interface DragSourceHandlers<T = DragData> {

    getDragData: () => T;

    type?: string;

    renderImage?: (item: T) => React.ReactNode;
    onDragStart?: (item: T) => void;
    onDragEnd?: (item: T, result: DragResult) => void;
}

export interface DropTargetHandlers<T = DragData> {

    canDrop?: (item: T) => boolean;
    onDragEnter?: (item: T, position: DropPosition) => void;
    onDragLeave?: (item: T) => void;

    onDrop?: (item: T, position: DropPosition) => void;

    type?: string;
}

export declare function allocDragId(): number;
export declare function setSource(id: number, h: DragSourceHandlers): void;
export declare function removeSource(id: number): void;
export declare function setTarget(id: number, h: DropTargetHandlers): void;
export declare function removeTarget(id: number): void;
export interface DragState {
    active: boolean;

    x: number;
    y: number;

    data: DragData;

    image: ((item: DragData) => React.ReactNode) | null;

    sourceId: number | null;

    overId: number | null;

    overPosition: DropPosition | null;
}

export declare function getDragState(): DragState;
export declare function subscribeDrag(l: () => void): () => void;
export declare function isDragging(): boolean;

export declare function beginDrag(sourceId: number, x: number, y: number): void;

export declare function moveDrag(x: number, y: number, overId: number | null, position?: DropPosition): void;

export declare function dropDrag(): void;

export declare function cancelDrag(): void;
