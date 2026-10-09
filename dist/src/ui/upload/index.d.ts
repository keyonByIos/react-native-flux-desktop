import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface UploadFile {
    uid: string;
    name: string;
    size?: number;
    path?: string;
}
export interface UploadProps {
    /** 文件列表（受控） */
    fileList?: UploadFile[];
    defaultFileList?: UploadFile[];
    /** 文件变化回调 */
    onChange?: (info: {
        fileList: UploadFile[];
        file?: UploadFile;
    }) => void;
    /** 最大文件数量 */
    maxCount?: number;
    /** 接受的文件扩展名（如 ['.png','.jpg']），空则不限 */
    accept?: string[];
    disabled?: boolean;
    /** 拖拽区提示文案 */
    hint?: React.ReactNode;
    /** 是否显示文件列表（默认 true） */
    showList?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function Upload(props: UploadProps): React.ReactElement;
export default Upload;
