import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TreeNode {
    key: string;
    title?: React.ReactNode;
    icon?: React.ReactNode | string;
    disabled?: boolean;
    selectable?: boolean;
    disableCheckbox?: boolean;
    children?: TreeNode[];
}
export interface TreeProps {
    treeData: TreeNode[];
    expandedKeys?: string[];
    defaultExpandedKeys?: string[];
    defaultExpandAll?: boolean;
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    checkedKeys?: string[];
    defaultCheckedKeys?: string[];
    checkable?: boolean;
    /** true 时父子勾选互不影响；默认 false（父子联动 + 半选） */
    checkStrict?: boolean;
    /** 是否可多选（默认 false 单选） */
    multiple?: boolean;
    /** 整树禁用 */
    disabled?: boolean;
    /** 整树不可选中 */
    selectable?: boolean;
    onExpand?: (keys: string[]) => void;
    onSelect?: (keys: string[]) => void;
    onCheck?: (keys: string[]) => void;
    /** 每层缩进 */
    indent?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Tree(props: TreeProps): React.ReactElement;
export default Tree;
