import type { MindMapEdge, MindMapNodeBox } from './mindmap-layout';
export interface DrawMindMapOptions {
    nodeStyle: 'filled' | 'line' | 'box';
    fontFamily: string;
    fontSize: number;

    primary: string;
    edgeColor: string;

    palette: string[];

    rootBg: string;
    rootText: string;

    padX: number;
    lineWidth: number;

    reveal: number;
}

export declare function drawMindMap(ctx: any, boxes: MindMapNodeBox[], edges: MindMapEdge[], opts: DrawMindMapOptions): void;
