import type { SceneNode } from '../scene/node';
import type { EditableController } from './editable';
/** 从命中节点向上找最近持有编辑控制器的可编辑节点 */
export declare function findEditable(node: SceneNode | null): SceneNode | null;
export declare function activeEditable(): SceneNode | null;
/** 当前聚焦字段的控制器；无焦点则 null。host 的 key/ime 处理据此分发。 */
export declare function activeController(): EditableController | null;
/**
 * 切换聚焦字段：先让旧字段 blur（提交其组合、清光标），再让新字段 focus。
 * 传入 null 表示点击空白/其它区域 → 取消焦点。同一字段重复设置不动作。
 */
export declare function setActiveEditable(n: SceneNode | null): void;
/** 字段卸载时调用：若它正聚焦则清除 active，避免悬垂引用导致后续事件打到已销毁控制器 */
export declare function forgetEditable(n: SceneNode): void;
