import { SceneNode } from '../scene/node';
/**
 * 返回包含该点的最上层可见节点。
 * 优先按 z-index 层级（高层级始终赢过低层级），同层级内文档顺序靠后者覆盖靠前。
 */
export declare function hitTest(root: SceneNode, px: number, py: number): SceneNode | null;
/** 从命中节点向上找最近的滚动容器 */
export declare function findScrollParent(node: SceneNode | null): SceneNode | null;
/** 从命中节点向上找最近的可交互祖先（RN 里 Pressable 包住 Text，点文字也要能按） */
export declare function findPressable(node: SceneNode | null): SceneNode | null;
/**
 * 从命中节点向上找最近带 `onMouseMove` 的节点（连续悬停移动派发用）。
 * 与 findPressable 解耦：一个只带 onMouseMove 的透明覆盖层（如图表 hover）不是 pressable，
 * 但仍需收到带局部坐标的连续 move，故单开一条上溯。
 */
export declare function findMoveTarget(node: SceneNode | null): SceneNode | null;
/** 向上找最近的拖拽源节点（按下后越阈起拖） */
export declare function findDraggable(node: SceneNode | null): SceneNode | null;
/** 向上找最近的放置目标节点（拖拽悬停/释放派发 enter/leave/drop） */
export declare function findDroppable(node: SceneNode | null): SceneNode | null;
/**
 * 从命中节点向上解析光标形状，返回底层 setCursor 可识别的规范名。
 * 优先级：最近的显式 style.cursor > 交互节点（禁用→not-allowed，启用→pointer）> default。
 * 与 findPressable 一致地在「第一个交互祖先」处止步，因此禁用按钮/日期格悬停即显示 not-allowed。
 */
export declare function findCursor(node: SceneNode | null): string;
