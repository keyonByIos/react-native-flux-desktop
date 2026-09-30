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

    checkStrict?: boolean;

    multiple?: boolean;

    disabled?: boolean;

    selectable?: boolean;
    onExpand?: (keys: string[]) => void;
    onSelect?: (keys: string[]) => void;
    onCheck?: (keys: string[]) => void;

    indent?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function Tree(props: TreeProps): React.ReactElement;
export default Tree;
