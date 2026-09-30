import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface LayoutProps {
    children?: React.ReactNode;
    /** 子项含 Sider 时置 true：Layout 自动改为横向排布（对齐 antd hasSider） */
    hasSider?: boolean;
    style?: StyleProp<ViewStyle>;
}
/** 外层容器：默认纵向，hasSider 时横向；底色用 Layout 背景 */
export declare function LayoutBase(props: LayoutProps): React.ReactElement;
export declare function Header(props: LayoutProps & {
    height?: number;
}): React.ReactElement;
export interface SiderProps extends LayoutProps {
    /** 侧栏配色：light=colorBgContainer（默认），dark=colorBgLayout（仍走 token，换算法自动跟皮） */
    theme?: 'light' | 'dark';
    width?: number;
    /** 折叠后宽度 */
    collapsedWidth?: number;
    collapsible?: boolean;
    /** 非受控初始折叠态 */
    defaultCollapsed?: boolean;
    /** 受控折叠态 */
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
    /** 触发箭头反向 */
    reverseArrow?: boolean;
    /** 隐藏内置 trigger（自带触发器时用） */
    trigger?: null;
}
export declare function Sider(props: SiderProps): React.ReactElement;
export declare function Content(props: LayoutProps): React.ReactElement;
export declare function Footer(props: LayoutProps): React.ReactElement;
/** Layout + Header/Sider/Content/Footer 复合导出 */
export declare const Layout: typeof LayoutBase & {
    Header: typeof Header;
    Sider: typeof Sider;
    Content: typeof Content;
    Footer: typeof Footer;
};
export default Layout;
