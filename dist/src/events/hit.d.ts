import { SceneNode } from '../scene/node';

export declare function hitTest(root: SceneNode, px: number, py: number): SceneNode | null;

export declare function findScrollParent(node: SceneNode | null): SceneNode | null;

export declare function findPressable(node: SceneNode | null): SceneNode | null;

export declare function findMoveTarget(node: SceneNode | null): SceneNode | null;

export declare function findDraggable(node: SceneNode | null): SceneNode | null;

export declare function findDroppable(node: SceneNode | null): SceneNode | null;

export declare function findCursor(node: SceneNode | null): string;
