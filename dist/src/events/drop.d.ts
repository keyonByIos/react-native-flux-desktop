export interface DropZoneHandlers {

    onEnter?: () => void;

    onLeave?: () => void;

    onDrop?: (paths: string[]) => void;
}

export declare function activateDropZone(id: number): void;

export declare function registerDropZone(handlers: DropZoneHandlers): number;
export declare function unregisterDropZone(id: number): void;

export declare function feedDrop(action: 'enter' | 'over' | 'leave' | 'drop', path: string): void;
