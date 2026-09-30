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
    /** 多选：树切换为 checkable，触发器以标签展示 */
    multiple?: boolean;
    /** 高度三档 */
    size?: TSize;
    /** 校验状态 */
    status?: 'error' | 'warning';
    /** 弹出方向 */
    placement?: TPlacement;
    /** 面板内联常驻展开（demo 用） */
    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (value: string | string[] | undefined) => void;
}
export declare function TreeSelect(props: TreeSelectProps): React.ReactElement;
export default TreeSelect;
