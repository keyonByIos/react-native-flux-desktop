import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type TodoId = string | number;
export interface TodoItem {
    id: TodoId;
    /** 标题：ReactNode，可放图标 / 标签等自定义内容 */
    title?: React.ReactNode;
    /** 描述：标题下方次级文本 */
    description?: React.ReactNode;
    /** 初始完成态（非受控时用于播种） */
    done?: boolean;
    /** 单项禁用：不可勾选 / 删除 */
    disabled?: boolean;
    /** 行右侧额外内容（标签 / 头像 / 操作等） */
    extra?: React.ReactNode;
    /** 自定义内容节点：替换默认「标题 + 描述」区，勾选框与右侧外壳保留 */
    node?: React.ReactNode;
}
/** renderItem 收到的行上下文：让自定义整行仍能驱动勾选 / 删除 */
export interface TodoRenderCtx {
    done: boolean;
    toggle: () => void;
    remove: () => void;
}
export interface TodoProps {
    /** 数据源 */
    items?: TodoItem[];
    /** 受控：已完成项 id 集合 */
    checked?: TodoId[];
    /** 非受控：初始已完成 id（缺省时用 items 的 done 播种） */
    defaultChecked?: TodoId[];
    /** 完成态变化（勾选 / 取消） */
    onChange?: (checkedIds: TodoId[]) => void;
    /** 删除某项（allowDelete 时点击删除触发；受控模式下父组件据此裁剪 items） */
    onDelete?: (item: TodoItem) => void;
    /** 整行自定义渲染：接管默认行，ctx 提供 done / toggle / remove */
    renderItem?: (item: TodoItem, index: number, ctx: TodoRenderCtx) => React.ReactNode;
    /** 顶部标题区 */
    header?: React.ReactNode;
    /** 底部自定义区（与 showCount 二选一或叠加） */
    footer?: React.ReactNode;
    /** 底部展示「已完成 x / 共 n」计数条 */
    showCount?: boolean;
    /** 每行末尾显示删除按钮 */
    allowDelete?: boolean;
    size?: 'small' | 'default' | 'large';
    /** 整表禁用 */
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}
declare function TodoBase(props: TodoProps): React.ReactElement;
export declare const Todo: typeof TodoBase;
export default Todo;
