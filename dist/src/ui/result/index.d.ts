import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';
export interface ResultProps {
    status?: ResultStatus;
    title?: React.ReactNode;
    subTitle?: React.ReactNode;
    extra?: React.ReactNode;

    icon?: React.ReactNode;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function Result(props: ResultProps): React.ReactElement;
