import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface FilePickerProps {

    value?: string[];

    defaultFiles?: string[];

    multiple?: boolean;

    accept?: string[];

    variant?: 'drag' | 'button';
    disabled?: boolean;

    title?: string;

    hint?: string;

    dialogTitle?: string;

    onChange?: (files: string[]) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function FilePicker(props: FilePickerProps): React.ReactElement;
export default FilePicker;
