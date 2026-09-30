import React from 'react';
export interface ChartExportButtonProps {

    target: React.RefObject<any>;

    filename?: string;

    title?: string;
    disabled?: boolean;
    onSaved?: (path: string) => void;
    style?: any;
}
export declare function ChartExportButton(props: ChartExportButtonProps): React.ReactElement;
export default ChartExportButton;
