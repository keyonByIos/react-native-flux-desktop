import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface AffixProps {
    children: React.ReactNode;

    offset?: number;

    scrollY?: number;

    onAffix?: (affixed: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function Affix(props: AffixProps): React.ReactElement;
export default Affix;
