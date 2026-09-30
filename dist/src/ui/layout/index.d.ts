import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface LayoutProps {
    children?: React.ReactNode;

    hasSider?: boolean;
    style?: StyleProp<ViewStyle>;
}

export declare function LayoutBase(props: LayoutProps): React.ReactElement;
export declare function Header(props: LayoutProps & {
    height?: number;
}): React.ReactElement;
export interface SiderProps extends LayoutProps {

    theme?: 'light' | 'dark';
    width?: number;

    collapsedWidth?: number;
    collapsible?: boolean;

    defaultCollapsed?: boolean;

    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;

    reverseArrow?: boolean;

    trigger?: null;
}
export declare function Sider(props: SiderProps): React.ReactElement;
export declare function Content(props: LayoutProps): React.ReactElement;
export declare function Footer(props: LayoutProps): React.ReactElement;

export declare const Layout: typeof LayoutBase & {
    Header: typeof Header;
    Sider: typeof Sider;
    Content: typeof Content;
    Footer: typeof Footer;
};
export default Layout;
