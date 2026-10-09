import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CardProps {
    title?: React.ReactNode;
    extra?: React.ReactNode;
    bordered?: boolean;
    size?: 'default' | 'small';
    /** 内部卡片（浅底） */
    type?: 'inner';
    /** 顶部封面（header 之下、body 之上，满宽） */
    cover?: React.ReactNode;
    /** 加载态：body 换成骨架占位 */
    loading?: boolean;
    /** 可悬停（本管线无阴影，降级为悬停描边转主色） */
    hoverable?: boolean;
    /** 底部等分的操作区 */
    actions?: React.ReactNode[];
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    headerStyle?: StyleProp<ViewStyle>;
    bodyStyle?: StyleProp<ViewStyle>;
}
export declare function CardBase(props: CardProps): React.ReactElement;
export interface CardMetaProps {
    avatar?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Meta(props: CardMetaProps): React.ReactElement;
/** Card + Card.Meta 复合导出 */
export declare const Card: typeof CardBase & {
    Meta: typeof Meta;
};
