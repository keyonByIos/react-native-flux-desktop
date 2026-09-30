import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface ProCardProps {
    title?: React.ReactNode;

    subtitle?: React.ReactNode;

    tooltip?: React.ReactNode;

    extra?: React.ReactNode;

    loading?: boolean;

    ghost?: boolean;

    bordered?: boolean;

    split?: 'vertical' | 'horizontal';

    collapsible?: boolean;

    defaultOpen?: boolean;

    open?: boolean;
    onOpenChange?: (open: boolean) => void;

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

    flex?: number;
    style?: StyleProp<ViewStyle>;
    bodyStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export declare function ProCardPanel(props: ProCardPanelProps): React.ReactElement;
export declare function ProCardBase(props: ProCardProps): React.ReactElement;

export declare const ProCard: typeof ProCardBase & {
    Panel: typeof ProCardPanel;
};
export default ProCard;
