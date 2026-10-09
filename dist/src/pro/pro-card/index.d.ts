import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface ProCardProps {
    title?: React.ReactNode;
    /** 副标题：紧跟主标题的次级灰字 */
    subtitle?: React.ReactNode;
    /** 标题后的帮助圈，hover 无浮层（本管线无 Tooltip 依赖）——纯提示标记；传字符串在圈后以浅色小字展示 */
    tooltip?: React.ReactNode;
    /** 页头右侧操作区 */
    extra?: React.ReactNode;
    /** 加载态：body 换成骨架 */
    loading?: boolean;
    /** 幽灵态：透明底、无描边、无内边距外壳（子面板自带间距），用于嵌入灰底页面 */
    ghost?: boolean;
    /** 是否描边（ghost 时忽略） */
    bordered?: boolean;
    /** 分栏：vertical=子面板横向并排（竖分隔线），horizontal=纵向堆叠（横分隔线） */
    split?: 'vertical' | 'horizontal';
    /** 页头可折叠 */
    collapsible?: boolean;
    /** 非受控初始展开态 */
    defaultOpen?: boolean;
    /** 受控展开态 */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** 整卡可点（如点区块跳转） */
    onClick?: () => void;
    style?: StyleProp<ViewStyle>;
    headerStyle?: StyleProp<ViewStyle>;
    bodyStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}
export interface ProCardPanelProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    extra?: React.ReactNode;
    tooltip?: React.ReactNode;
    loading?: boolean;
    /** 占比（flex），默认等分 1 */
    flex?: number;
    style?: StyleProp<ViewStyle>;
    bodyStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}
/** 子面板：在 split 布局下作为一格；单独使用等价于一块带标题的分区 */
export declare function ProCardPanel(props: ProCardPanelProps): React.ReactElement;
export declare function ProCardBase(props: ProCardProps): React.ReactElement;
/** ProCard + ProCard.Panel 复合导出 */
export declare const ProCard: typeof ProCardBase & {
    Panel: typeof ProCardPanel;
};
export default ProCard;
