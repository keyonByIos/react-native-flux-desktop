import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TransferItem {
    key: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
}
export interface TransferProps {
    dataSource: TransferItem[];
    targetKeys?: string[];
    defaultTargetKeys?: string[];
    titles?: [React.ReactNode, React.ReactNode];

    operations?: [React.ReactNode, React.ReactNode];

    showSelectAll?: boolean;

    oneWay?: boolean;
    disabled?: boolean;
    listStyle?: StyleProp<ViewStyle>;
    onChange?: (targetKeys: string[]) => void;
}
export declare function Transfer(props: TransferProps): React.ReactElement;
