import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from '../../types';
export type TextType = 'secondary' | 'success' | 'warning' | 'danger';
/** copyable 配置（对齐 antd）：text 覆盖复制内容、onCopy 回调、tooltips 预留 */
export interface CopyableConfig {
    /** 要复制的文本；缺省时取 children（仅当 children 为字符串） */
    text?: string;
    onCopy?: () => void;
    tooltips?: [React.ReactNode, React.ReactNode];
}
export type Copyable = boolean | CopyableConfig;
/** 共享装饰 props（对齐 antd：strong/italic/underline/delete/mark + 语义 type/disabled） */
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
/** 标题：级别越高字号越大，尺寸全部从 fontSizeLG/XL 派生 */
export declare function Title(props: TitleProps): React.ReactElement;
export interface ParagraphProps extends Decor {
    children?: React.ReactNode;
    /** 超行数省略（painter 层 numberOfLines） */
    ellipsis?: boolean | {
        rows?: number;
    };
    /** 可复制：段尾追加复制图标，点击写剪贴板 */
    copyable?: Copyable;
    style?: StyleProp<TextStyle>;
}
export declare function Paragraph(props: ParagraphProps): React.ReactElement;
export interface TextProps extends Decor {
    children?: React.ReactNode;
    /** 行内代码：带底色小块 */
    code?: boolean;
    /** 可复制：文本后追加复制图标，点击写剪贴板 */
    copyable?: Copyable;
    style?: StyleProp<TextStyle>;
}
/** 内联文本：语义色 + 装饰变体 */
export declare function TextEl(props: TextProps): React.ReactElement;
export interface LinkProps {
    children?: React.ReactNode;
    /** 链接地址（当前渲染管线仅作语义占位，不触发真实跳转） */
    href?: string;
    /** 打开方式（占位，同 href） */
    target?: string;
    disabled?: boolean;
    /** 点击回调（约定统一用 onClick） */
    onClick?: () => void;
    style?: StyleProp<TextStyle>;
}
/** 链接：colorLink 着色，hover 变主色并下划线，可点击 */
export declare function Link(props: LinkProps): React.ReactElement;
export declare const Typography: {
    Title: typeof Title;
    Paragraph: typeof Paragraph;
    Text: typeof TextEl;
    Link: typeof Link;
};
export default Typography;
