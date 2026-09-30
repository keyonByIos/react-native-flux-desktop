import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type TodoId = string | number;
export interface TodoItem {
    id: TodoId;

    title?: React.ReactNode;

    description?: React.ReactNode;

    done?: boolean;

    disabled?: boolean;

    extra?: React.ReactNode;

    node?: React.ReactNode;
}

export interface TodoRenderCtx {
    done: boolean;
    toggle: () => void;
    remove: () => void;
}
export interface TodoProps {

    items?: TodoItem[];

    checked?: TodoId[];

    defaultChecked?: TodoId[];

    onChange?: (checkedIds: TodoId[]) => void;

    onDelete?: (item: TodoItem) => void;

    renderItem?: (item: TodoItem, index: number, ctx: TodoRenderCtx) => React.ReactNode;

    header?: React.ReactNode;

    footer?: React.ReactNode;

    showCount?: boolean;

    allowDelete?: boolean;
    size?: 'small' | 'default' | 'large';

    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}
declare function TodoBase(props: TodoProps): React.ReactElement;
export declare const Todo: typeof TodoBase;
export default Todo;
