import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
/** 折叠能力：布尔或 { start, end } 分别控制面板两端 */
export type SplitterCollapsible = boolean | {
    start?: boolean;
    end?: boolean;
};
export interface SplitterPanelProps {
    children?: React.ReactNode;
    /** 初始占比（%），对齐 antd defaultSize；折叠时回到 0 */
    defaultSize?: number | string;
    /** 兼容旧字段：等价 defaultSize */
    size?: number | string;
    /** 是否允许折叠：布尔或 { start, end } 分别控制两端 */
    collapsible?: SplitterCollapsible;
    style?: StyleProp<ViewStyle>;
}
export declare function SplitterPanel(props: SplitterPanelProps): React.ReactElement;
export interface SplitterProps {
    /** 子项必须是 SplitterPanel */
    children?: React.ReactElement<SplitterPanelProps>[];
    layout?: 'horizontal' | 'vertical';
    /** 折叠状态变化回调 */
    onCollapse?: (index: number, collapsed: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
declare function SplitterBase(props: SplitterProps): React.ReactElement;
export declare const Splitter: typeof SplitterBase & {
    Panel: typeof SplitterPanel;
};
export default Splitter;
