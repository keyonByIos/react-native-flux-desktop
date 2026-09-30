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
    /** 两个操作按钮的文案（默认左右箭头） */
    operations?: [React.ReactNode, React.ReactNode];
    /** 是否显示表头全选框（默认 true） */
    showSelectAll?: boolean;
    /** 单向样式：无中间按钮，点左项直接移入右，右项带移除按钮 */
    oneWay?: boolean;
    disabled?: boolean;
    listStyle?: StyleProp<ViewStyle>;
    onChange?: (targetKeys: string[]) => void;
}
export declare function Transfer(props: TransferProps): React.ReactElement;
