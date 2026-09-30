import React from 'react';
import { StyleProp, ViewStyle } from '../../types';

export type SaveContent = string | Buffer | Uint8Array;

export type SaveSource = SaveContent | (() => SaveContent | Promise<SaveContent>);
export interface FileSaverProps {

    data: SaveSource;

    filename?: string;

    accept?: string[];

    title?: string;

    dialogTitle?: string;
    disabled?: boolean;

    onSaved?: (path: string) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function FileSaver(props: FileSaverProps): React.ReactElement;
export default FileSaver;
