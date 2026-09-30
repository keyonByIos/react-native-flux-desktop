import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface RegexTesterProps {

    defaultPattern?: string;

    defaultText?: string;

    defaultFlags?: string;

    defaultReplacement?: string;

    showReplace?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function RegexTester(props: RegexTesterProps): React.ReactElement;
export default RegexTester;
