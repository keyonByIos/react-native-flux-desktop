export interface DropZoneHandlers {
    /** 拖入悬停（高亮） */
    onEnter?: () => void;
    /** 移出/取消（取消高亮） */
    onLeave?: () => void;
    /** 放下：paths 为本次拖入的全部文件绝对路径 */
    onDrop?: (paths: string[]) => void;
}
/** 把一个 zone 提升为当前激活目标（组件在 hover/聚焦时调用，改善多目标路由） */
export declare function activateDropZone(id: number): void;
/** 注册一个放置目标，返回卸载函数 */
export declare function registerDropZone(handlers: DropZoneHandlers): number;
export declare function unregisterDropZone(id: number): void;
/** host 在每次原生 drop 事件回调时喂进来；action 来自 Rust（enter/leave/drop） */
export declare function feedDrop(action: 'enter' | 'over' | 'leave' | 'drop', path: string): void;
