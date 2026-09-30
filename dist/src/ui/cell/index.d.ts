import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CellProps {
    title?: React.ReactNode;
    description?: React.ReactNode;

    icon?: React.ReactNode | string;

    extra?: React.ReactNode;

    arrow?: boolean;
    clickable?: boolean;

    disabled?: boolean;

    onClick?: () => void;
    onPress?: () => void;

    bordered?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Cell(props: CellProps): React.ReactElement;
