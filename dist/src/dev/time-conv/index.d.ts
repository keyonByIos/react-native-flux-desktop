import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface TimeConverterProps {

    defaultStamp?: string;

    defaultDate?: string;

    liveClock?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function TimeConverter(props: TimeConverterProps): React.ReactElement;
export default TimeConverter;
