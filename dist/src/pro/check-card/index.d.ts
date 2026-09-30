import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CheckCardProps {
    value?: string | number;
    title?: React.ReactNode;
    description?: React.ReactNode;
    /** 左侧圆形头像位（传字符则显首字，或传 ReactNode） */
    avatar?: React.ReactNode;
    /** 顶部封面（满宽，置于标题之上） */
    cover?: React.ReactNode;
    checked?: boolean;
    disabled?: boolean;
    /** 受控单卡点击 */
    onChange?: (checked: boolean) => void;
    /** Group 内部注入 */
    onPress?: () => void;
    /** 卡片宽度（默认撑满父容器；Group 内由 itemWidth 约束） */
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
    /** 单选：string|number；多选：数组 */
    value?: (string | number)[] | string | number;
    defaultValue?: (string | number)[] | string | number;
    onChange?: (value: (string | number)[] | string | number | undefined) => void;
    multiple?: boolean;
    disabled?: boolean;
    /** 每卡固定宽（默认 220） */
    itemWidth?: number;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}
declare function CheckCardFn(props: CheckCardProps): React.ReactElement;
declare function GroupBase(props: CheckCardGroupProps): React.ReactElement;
/** CheckCard + CheckCard.Group 复合导出 */
export declare const CheckCard: typeof CheckCardFn & {
    Group: typeof GroupBase;
};
export declare const CheckCardGroup: typeof GroupBase;
export default CheckCard;
