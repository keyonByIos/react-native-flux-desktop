import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CommandItem {
    id: string;
    label: string;

    hint?: string;

    group?: string;

    keywords?: string;
}
export interface CommandPaletteProps {
    items: CommandItem[];
    placeholder?: string;

    maxResults?: number;
    emptyText?: string;
    autoFocus?: boolean;
    onSelect?: (item: CommandItem) => void;
    style?: StyleProp<ViewStyle>;
}
export declare function CommandPalette(props: CommandPaletteProps): React.ReactElement;
export default CommandPalette;
