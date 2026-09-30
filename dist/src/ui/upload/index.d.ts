import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface UploadFile {
    uid: string;
    name: string;
    size?: number;
    path?: string;
}
export interface UploadProps {

    fileList?: UploadFile[];
    defaultFileList?: UploadFile[];

    onChange?: (info: {
        fileList: UploadFile[];
        file?: UploadFile;
    }) => void;

    maxCount?: number;

    accept?: string[];
    disabled?: boolean;

    hint?: React.ReactNode;

    showList?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function Upload(props: UploadProps): React.ReactElement;
export default Upload;
