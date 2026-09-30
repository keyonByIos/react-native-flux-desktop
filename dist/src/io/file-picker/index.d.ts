import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface FilePickerProps {
    /** 受控：已选文件绝对路径列表 */
    value?: string[];
    /** 非受控初始值 */
    defaultFiles?: string[];
    /** 允许多选（拖拽/对话框均生效） */
    multiple?: boolean;
    /** 扩展名过滤，如 ['.png', '.jpg']；对话框与拖拽落下的文件都会按此过滤 */
    accept?: string[];
    /** 形态：drag=大拖拽区（默认），button=紧凑按钮 */
    variant?: 'drag' | 'button';
    disabled?: boolean;
    /** 主提示文案 */
    title?: string;
    /** 副提示文案（drag 形态） */
    hint?: string;
    /** 对话框标题 */
    dialogTitle?: string;
    /** 选中文本变化（新增/移除/清空） */
    onChange?: (files: string[]) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function FilePicker(props: FilePickerProps): React.ReactElement;
export default FilePicker;
