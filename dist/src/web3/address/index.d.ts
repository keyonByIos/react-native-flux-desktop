import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AddressProps {

    address: string;

    name?: string;

    chain?: string;
    chainColor?: string;

    truncated?: boolean | {
        lead?: number;
        trail?: number;
    };

    prefix?: React.ReactNode | false;
    copyable?: boolean;

    scanCode?: boolean;

    openInExplorer?: boolean;
    size?: 'small' | 'middle' | 'large';
    style?: StyleProp<ViewStyle>;
}
export declare function Address(props: AddressProps): React.ReactElement;
export default Address;
