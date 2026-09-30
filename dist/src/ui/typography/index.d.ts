import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from '../../types';
export type TextType = 'secondary' | 'success' | 'warning' | 'danger';

export interface CopyableConfig {

    text?: string;
    onCopy?: () => void;
    tooltips?: [React.ReactNode, React.ReactNode];
}
export type Copyable = boolean | CopyableConfig;

interface Decor {
    type?: TextType;
    disabled?: boolean;
    strong?: boolean;
    italic?: boolean;
    underline?: boolean;
    delete?: boolean;
    mark?: boolean;
}
export interface TitleProps extends Decor {
    level?: 1 | 2 | 3 | 4 | 5;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export declare function Title(props: TitleProps): React.ReactElement;
export interface ParagraphProps extends Decor {
    children?: React.ReactNode;

    ellipsis?: boolean | {
        rows?: number;
    };

    copyable?: Copyable;
    style?: StyleProp<TextStyle>;
}
export declare function Paragraph(props: ParagraphProps): React.ReactElement;
export interface TextProps extends Decor {
    children?: React.ReactNode;

    code?: boolean;

    copyable?: Copyable;
    style?: StyleProp<TextStyle>;
}

export declare function TextEl(props: TextProps): React.ReactElement;
export interface LinkProps {
    children?: React.ReactNode;

    href?: string;

    target?: string;
    disabled?: boolean;

    onClick?: () => void;
    style?: StyleProp<TextStyle>;
}

export declare function Link(props: LinkProps): React.ReactElement;
export declare const Typography: {
    Title: typeof Title;
    Paragraph: typeof Paragraph;
    Text: typeof TextEl;
    Link: typeof Link;
};
export default Typography;
