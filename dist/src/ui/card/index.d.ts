import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CardProps {
    title?: React.ReactNode;
    extra?: React.ReactNode;
    bordered?: boolean;
    size?: 'default' | 'small';

    type?: 'inner';

    cover?: React.ReactNode;

    loading?: boolean;

    hoverable?: boolean;

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

export declare const Card: typeof CardBase & {
    Meta: typeof Meta;
};
