import { SceneNode } from '../scene/node';
import { WindowHost } from '../window/host';
import { FlatStyle } from '../style/flatten';
export type AppContainer = Set<SceneNode>;
export declare const appContainer: AppContainer;
declare const hosts: WeakMap<SceneNode, WindowHost>;
export declare function getActiveHost(): WindowHost | null;

export declare function textStyleFor(node: SceneNode): FlatStyle;
declare const reconciler: any;
export default reconciler;
export { hosts };
