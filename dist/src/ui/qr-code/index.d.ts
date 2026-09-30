import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned';
export interface QRCodeProps {
    value?: string;

    size?: number;

    color?: string;

    bgColor?: string;
    bordered?: boolean;
    status?: QRCodeStatus;

    modules?: number;

    icon?: React.ReactNode;

    iconSize?: number;
    onRefresh?: () => void;

    statusRender?: (info: {
        status: QRCodeStatus;
        onRefresh?: () => void;
    }) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export declare function QRCode(props: QRCodeProps): React.ReactElement;
export default QRCode;
