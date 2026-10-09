import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
/** 可直接写盘的原始内容 */
export type SaveContent = string | Buffer | Uint8Array;
/** 内容来源：定值，或返回定值的（可异步）函数（点击时才求值，适合大/贵内容） */
export type SaveSource = SaveContent | (() => SaveContent | Promise<SaveContent>);
export interface FileSaverProps {
    /** 要写入的内容：string / Buffer / Uint8Array / dataURL，或返回它们的（异步）函数 */
    data: SaveSource;
    /** 默认文件名（含扩展名），对话框打开时预填 */
    filename?: string;
    /** 扩展名过滤，如 ['.txt', '.json']；决定对话框的保存类型下拉 */
    accept?: string[];
    /** 按钮文案 */
    title?: string;
    /** 对话框标题 */
    dialogTitle?: string;
    disabled?: boolean;
    /** 保存成功回调（回传最终绝对路径） */
    onSaved?: (path: string) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function FileSaver(props: FileSaverProps): React.ReactElement;
export default FileSaver;
