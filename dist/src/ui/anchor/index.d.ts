import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AnchorLink {

    href: string;
    title: string;

    children?: AnchorLink[];
}
export interface AnchorProps {
    items: AnchorLink[];

    activeHref: string;

    onLinkClick?: (href: string) => void;

    onChange?: (href: string) => void;

    title?: string;

    showLine?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function Anchor(props: AnchorProps): React.ReactElement;
export default Anchor;
