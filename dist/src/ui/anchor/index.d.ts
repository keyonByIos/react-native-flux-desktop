import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AnchorLink {
    /** 唯一标识，作为 activeHref 比对值 */
    href: string;
    title: string;
    /** 子级链接（缩进一级） */
    children?: AnchorLink[];
}
export interface AnchorProps {
    items: AnchorLink[];
    /** 当前高亮的 href（受控；文档页由滚动联动实时回写） */
    activeHref: string;
    /** 点击某锚点 */
    onLinkClick?: (href: string) => void;
    /** 对齐 antd：选中项变化回调（点击时与 onLinkClick 一并触发） */
    onChange?: (href: string) => void;
    /** 锚点组上方的标题（如「本页目录」），可选 */
    title?: string;
    /** 是否显示左侧垂直线轨道，默认 true；传 false 隐藏 */
    showLine?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function Anchor(props: AnchorProps): React.ReactElement;
export default Anchor;
