import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type SpaceSize } from '../../ui/space';
import { type ChartTheme } from './theme';
import { type BandScale } from './scale';
import { type GridConfig } from './grid';

export declare function useChartTheme(): ChartTheme;

export declare function useEnter(enabled: boolean, duration: number): number;

export declare function useMeasuredWidth(fallback: number): [number, (e: {
    nativeEvent: {
        layout: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
    };
}) => void];
export interface LegendItem {
    name: string;
    color: string;
}

export declare function ChartLegend(props: {
    items: LegendItem[];
    shape?: 'circle' | 'line';
    direction?: 'horizontal' | 'vertical';
    size?: SpaceSize;
    style?: StyleProp<ViewStyle>;

    active?: boolean[];

    onToggleIndex?: (index: number) => void;
}): React.ReactElement;

export declare function useLegendToggle(count: number): {
    isHidden: (i: number) => boolean;
    toggle: (i: number) => void;
    active: boolean[];
};

export interface TooltipRow {
    name: string;
    value: string;
    color?: string;
}
export interface TooltipModel {
    title: string;
    rows: TooltipRow[];
}

export interface PlotCtx {
    padL: number;
    padT: number;
    plotW: number;
    plotH: number;

    xAt: (i: number) => number;

    yAt: (v: number) => number;

    baseline: number;

    band: (count: number, inner?: number) => BandScale;

    activeIndex: number | null;
}

export interface RefLine {
    value: number;
    label?: string;
    color?: string;
}

export declare function ReferenceLines(props: {
    lines: RefLine[];
    ctx: PlotCtx;
    color?: string;
    theme: ChartTheme;
    formatter?: (v: number) => string;
}): React.ReactElement;
export interface PlotProps {
    width: number;
    height: number;
    categories: string[];
    yTicks: number[];
    yMax: number;
    yFormatter?: (v: number) => string;
    xFormatter?: (s: string) => string;
    showGrid?: boolean;

    grid?: GridConfig;

    xLabelPositions?: number[];

    interactive?: boolean;

    tooltipFor?: (index: number) => TooltipModel | null;
    children: (ctx: PlotCtx) => React.ReactNode;
}

export declare function Plot(props: PlotProps): React.ReactElement;
