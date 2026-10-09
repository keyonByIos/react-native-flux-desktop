import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CascaderOption {
    label: React.ReactNode;
    value: string;
    disabled?: boolean;
    children?: CascaderOption[];
}
export interface CascaderProps {
    options: CascaderOption[];
    /** 选中路径（各级 value 数组） */
    value?: string[];
    defaultValue?: string[];
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    /** 尺寸 */
    size?: 'large' | 'middle' | 'small';
    /** 面板弹出方向 */
    placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
    /** 展开下一级的触发方式：点击 / 悬停 */
    expandTrigger?: 'click' | 'hover';
    /** 选中任意一级即提交（默认仅叶子节点提交） */
    changeOnSelect?: boolean;
    /** 自定义触发器回显 */
    displayRender?: (labels: React.ReactNode[], selectedOptions: CascaderOption[]) => React.ReactNode;
    /** 是否显示右侧箭头 */
    showArrow?: boolean;
    /** 校验状态 */
    status?: 'error' | 'warning';
    /** 面板内联常驻展开（demo 用） */
    open?: boolean;
    style?: StyleProp<ViewStyle>;
    onChange?: (value: string[], selectedOptions: CascaderOption[]) => void;
}
export declare function Cascader(props: CascaderProps): React.ReactElement;
export default Cascader;
