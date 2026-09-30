import React from 'react';

export interface GridConfig {

    show?: boolean;

    color?: string;

    dashed?: boolean;

    thickness?: number;

    vertical?: boolean;
}
export interface GridLinesProps {

    area: {
        left: number;
        top: number;
        width: number;
        height: number;
    };

    horizontal?: number[];

    vertical?: number[];

    config?: GridConfig;

    fallbackColor?: string;
}

export declare function GridLines(props: GridLinesProps): React.ReactElement;
export default GridLines;
