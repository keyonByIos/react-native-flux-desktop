import React from 'react';
import type { Pt } from './geometry';

export declare function Segments(props: {
    pts: Pt[];
    color: string;
    width?: number;
    opacity?: number;
    dash?: [number, number];
}): React.ReactElement;

export declare function Dots(props: {
    pts: Pt[];
    color: string;
    r?: number;
    opacity?: number;
    bg?: string;
}): React.ReactElement;
