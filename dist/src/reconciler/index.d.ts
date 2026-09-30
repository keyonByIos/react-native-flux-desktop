import { SceneNode } from '../scene/node';
import { WindowHost } from '../window/host';
import { FlatStyle } from '../style/flatten';
export type AppContainer = Set<SceneNode>;
export declare const appContainer: AppContainer;
declare const hosts: WeakMap<SceneNode, WindowHost>;
export declare function getActiveHost(): WindowHost | null;
/**
 * 裸文本节点（<Text>里的字符串）自己没有 fontSize/color，
 * 必须沿父链继承，否则测量与绘制都会退化成默认 14px 黑字。
 */
export declare function textStyleFor(node: SceneNode): FlatStyle;
declare const reconciler: any;
export default reconciler;
export { hosts };
