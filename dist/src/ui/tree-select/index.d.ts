import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { TreeNode } from '../tree';
type TSize = 'large' | 'middle' | 'small';
type TPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export interface TreeSelectProps {
    treeData: TreeNode[];
    value?: string | string[];
    defaultValue?: string | string[];
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;

    multiple?: boolean;

    size?: TSize;

    status?: 'error' | 'warning';

    placement?: TPlacement;

    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (value: string | string[] | undefined) => void;
}
export declare function TreeSelect(props: TreeSelectProps): React.ReactElement;
export default TreeSelect;
