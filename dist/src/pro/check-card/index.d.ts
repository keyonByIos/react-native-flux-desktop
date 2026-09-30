import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CheckCardProps {
    value?: string | number;
    title?: React.ReactNode;
    description?: React.ReactNode;

    avatar?: React.ReactNode;

    cover?: React.ReactNode;
    checked?: boolean;
    disabled?: boolean;

    onChange?: (checked: boolean) => void;

    onPress?: () => void;

    width?: number | string;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}
export interface CheckCardOption {
    value: string | number;
    title?: React.ReactNode;
    description?: React.ReactNode;
    avatar?: React.ReactNode;
    disabled?: boolean;
}
export interface CheckCardGroupProps {
    options?: CheckCardOption[];

    value?: (string | number)[] | string | number;
    defaultValue?: (string | number)[] | string | number;
    onChange?: (value: (string | number)[] | string | number | undefined) => void;
    multiple?: boolean;
    disabled?: boolean;

    itemWidth?: number;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}
declare function CheckCardFn(props: CheckCardProps): React.ReactElement;
declare function GroupBase(props: CheckCardGroupProps): React.ReactElement;

export declare const CheckCard: typeof CheckCardFn & {
    Group: typeof GroupBase;
};
export declare const CheckCardGroup: typeof GroupBase;
export default CheckCard;
