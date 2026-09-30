import React from 'react';
import { type DragData, type DragResult, type DropPosition } from '../../window/drag';

export interface UseDragOptions<T = DragData> {

    getDragData: () => T;

    type?: string;

    renderImage?: (item: T) => React.ReactNode;
    onDragStart?: (item: T) => void;
    onDragEnd?: (item: T, result: DragResult) => void;
}

export interface UseDropOptions<T = DragData> {

    canDrop?: (item: T) => boolean;
    onDragEnter?: (item: T, position: DropPosition) => void;
    onDragLeave?: (item: T) => void;

    onDrop?: (item: T, position: DropPosition) => void;

    type?: string;
}

export interface DragBindProps {
    __drag: {
        id: number;
    };
}

export interface DropBindProps {
    __drop: {
        id: number;
    };
}

export declare function useDrag<T = DragData>(options: UseDragOptions<T>): [DragBindProps, {
    isDragging: boolean;
}];

export declare function useDrop<T = DragData>(options?: UseDropOptions<T>): [DropBindProps, {
    isOver: boolean;
    position: DropPosition | null;
}];

export declare function DragLayer(): React.ReactElement | null;
export default DragLayer;
