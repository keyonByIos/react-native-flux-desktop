import { FlatStyle } from '../style/flatten';
export type NodeKind = 'view' | 'text' | 'image' | 'video' | 'icon' | 'window' | 'scroll';
export interface SceneNode {
    id: number;
    kind: NodeKind;
    props: Record<string, any>;
    style: FlatStyle;

    text: string;

    yoga: any;
    parent: SceneNode | null;
    children: SceneNode[];

    visible: boolean;

    x: number;
    y: number;
    w: number;
    h: number;

    ax: number;
    ay: number;

    scrollX: number;
    scrollY: number;

    __cullClean?: boolean;

    __noOverlay?: boolean;

    __mutEpoch?: number;

    __layEpoch?: number;

    __bm?: {
        canvas: any;
        ctx: any;
        w: number;
        h: number;
        epoch: number;
        gen: number;
    } | null;

    __hasVideo?: boolean;

    __hasImage?: boolean;

    __shrinkOff?: boolean;

    measure?: (width: number, widthMode: number, height: number, heightMode: number) => {
        width: number;
        height: number;
    };

    __input?: import('../events/editable').EditableController;
}

export declare function touch(node: SceneNode | null): void;

export declare function takeDirty(): SceneNode[];

export declare function touchLayout(node: SceneNode | null): void;
export declare function createSceneNode(kind: NodeKind, props?: Record<string, any>): SceneNode;
export declare function setProps(node: SceneNode, props: Record<string, any>): void;

export declare function setText(node: SceneNode, text: string): void;
export declare function appendChild(parent: SceneNode, child: SceneNode): void;
export declare function insertBefore(parent: SceneNode, child: SceneNode, before: SceneNode): void;
export declare function removeChild(parent: SceneNode, child: SceneNode): void;

export declare function collectLayout(node: SceneNode, ox?: number, oy?: number): void;

export declare function applyScrollSemantics(node: SceneNode): void;

export declare function scrollContentSize(node: SceneNode): {
    w: number;
    h: number;
};

export declare function walk(root: SceneNode, fn: (n: SceneNode, depth: number) => void, depth?: number): void;
