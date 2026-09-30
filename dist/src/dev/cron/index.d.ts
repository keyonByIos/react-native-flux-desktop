import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CronParserProps {

    defaultValue?: string;

    previewCount?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function CronParser(props: CronParserProps): React.ReactElement;
export default CronParser;
