import type { MindMapEdge, MindMapNodeBox } from './mindmap-layout';
export interface DrawMindMapOptions {
    nodeStyle: 'filled' | 'line' | 'box';
    fontFamily: string;
    fontSize: number;
    /** filled 模式的节点/边主色与边色 */
    primary: string;
    edgeColor: string;
    /** line / box 模式按分支取色 */
    palette: string[];
    /** line / box 模式根节点灰底与文字色 */
    rootBg: string;
    rootText: string;
    /** 节点内文字左右内边距（下划线收短用） */
    padX: number;
    lineWidth: number;
    /** 入场淡入 0→1 */
    reveal: number;
}
/** 主入口：先边后节点。清空由 CanvasLayer 负责。 */
export declare function drawMindMap(ctx: any, boxes: MindMapNodeBox[], edges: MindMapEdge[], opts: DrawMindMapOptions): void;
