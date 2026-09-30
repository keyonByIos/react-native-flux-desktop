import type { SceneNode } from '../scene/node';
import type { EditableController } from './editable';

export declare function findEditable(node: SceneNode | null): SceneNode | null;
export declare function activeEditable(): SceneNode | null;

export declare function activeController(): EditableController | null;

export declare function setActiveEditable(n: SceneNode | null): void;

export declare function forgetEditable(n: SceneNode): void;
