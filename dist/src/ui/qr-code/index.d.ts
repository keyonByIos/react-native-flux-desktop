import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned';
export interface QRCodeProps {
    value?: string;
    /** 边长（px）。默认 controlHeightLG * 4 */
    size?: number;
    /** 前景色（模块）。默认 colorText */
    color?: string;
    /** 背景色。默认 colorBgContainer */
    bgColor?: string;
    bordered?: boolean;
    status?: QRCodeStatus;
    /** 矩阵边长（模块数，含定位角）。默认 25 */
    modules?: number;
    /** 中心 logo：叠加在二维码中央的节点（如 Icon / 圆形徽标） */
    icon?: React.ReactNode;
    /** 中心 logo 边长（px）。默认 size 的 1/5 */
    iconSize?: number;
    onRefresh?: () => void;
    /** 自定义状态遮罩渲染；返回 null 可隐藏默认遮罩 */
    statusRender?: (info: {
        status: QRCodeStatus;
        onRefresh?: () => void;
    }) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function QRCode(props: QRCodeProps): React.ReactElement;
export default QRCode;
