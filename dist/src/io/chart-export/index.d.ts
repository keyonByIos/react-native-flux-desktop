import React from 'react';
export interface ChartExportButtonProps {
    /** 要导出的节点容器（任意 RN 元素，ref 透传到场景节点） */
    target: React.RefObject<any>;
    /** 默认文件名（含 .png） */
    filename?: string;
    /** 按钮文案 */
    title?: string;
    disabled?: boolean;
    onSaved?: (path: string) => void;
    style?: any;
}
export declare function ChartExportButton(props: ChartExportButtonProps): React.ReactElement;
export default ChartExportButton;
