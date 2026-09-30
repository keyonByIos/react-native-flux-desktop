import React from 'react';
import { StyleProp, ViewStyle } from '../../types';

export type SplitterCollapsible = boolean | {
    start?: boolean;
    end?: boolean;
};
export interface SplitterPanelProps {
    children?: React.ReactNode;

    defaultSize?: number | string;

    size?: number | string;

    collapsible?: SplitterCollapsible;
    style?: StyleProp<ViewStyle>;
}
export declare function SplitterPanel(props: SplitterPanelProps): React.ReactElement;
export interface SplitterProps {

    children?: React.ReactElement<SplitterPanelProps>[];
    layout?: 'horizontal' | 'vertical';

    onCollapse?: (index: number, collapsed: boolean) => void;
    style?: StyleProp<ViewStyle>;
}
declare function SplitterBase(props: SplitterProps): React.ReactElement;
export declare const Splitter: typeof SplitterBase & {
    Panel: typeof SplitterPanel;
};
export default Splitter;
