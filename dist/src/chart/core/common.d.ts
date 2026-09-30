import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type SpaceSize } from '../../ui/space';
import { type ChartTheme } from './theme';
import { type BandScale } from './scale';
import { type GridConfig } from './grid';
/** token -> 图表皮肤。 */
export declare function useChartTheme(): ChartTheme;
/** 入场进度 0→1；enabled=false 或抓帧模式（FLUX_GRAB_DIR）下恒返回 1——静态帧显示落位成品，实机才见动画。 */
export declare function useEnter(enabled: boolean, duration: number): number;
/** 测宽：onLayout 回传内容宽度，首帧用 fallback（避免 0 宽空图）。 */
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
/** 图例：色点 / 色条 + 名称，用 Space 包裹保持等距（单一 size 同时控制行/列间距）。
 *  传 onToggleIndex 进入「可点切换」态：active[i]=false 的序列置灰，点击回调切换显隐（antd/G2 图例交互）。*/
export declare function ChartLegend(props: {
    items: LegendItem[];
    shape?: 'circle' | 'line';
    direction?: 'horizontal' | 'vertical';
    size?: SpaceSize;
    style?: StyleProp<ViewStyle>;
    /** 各序列是否显示（长度同 items）；缺省视为全显示 */
    active?: boolean[];
    /** 提供则图例可点切换显隐 */
    onToggleIndex?: (index: number) => void;
}): React.ReactElement;
/** 图例显隐状态：返回隐藏集合 + 切换 + 判定 + 供 ChartLegend 的 active 数组。 */
export declare function useLegendToggle(count: number): {
    isHidden: (i: number) => boolean;
    toggle: (i: number) => void;
    active: boolean[];
};
/** 悬浮提示：一个类目的标题 + 若干「色点 + 名称 + 值」行。 */
export interface TooltipRow {
    name: string;
    value: string;
    color?: string;
}
export interface TooltipModel {
    title: string;
    rows: TooltipRow[];
}
/** 笛卡尔绘图坐标上下文：像素比例尺 + 绘图盒几何 + 当前悬浮类目。 */
export interface PlotCtx {
    padL: number;
    padT: number;
    plotW: number;
    plotH: number;
    /** 类目点位的 x（等距，用于折线/散点） */
    xAt: (i: number) => number;
    /** 数值 v 的 y（0 落在基线） */
    yAt: (v: number) => number;
    /** 基线 y（v=0） */
    baseline: number;
    /** 类目带宽比例尺（用于柱状） */
    band: (count: number, inner?: number) => BandScale;
    /** 交互开启时的当前悬浮类目索引（否则 null）——子 mark 可据此高亮点/柱 */
    activeIndex: number | null;
}
/** 参考线（阈值/目标线）：值 + 可选标签 + 可选颜色（缺省用 danger 红）。 */
export interface RefLine {
    value: number;
    label?: string;
    color?: string;
}
/**
 * 横向参考线：在给定 y 像素处画一条虚线贯穿绘图区，右端挂小标签。
 * 由子图在 children(ctx) 里调用（需 ctx 的 padL/plotW/yAt 把数据值换算成像素）。参考 antd/G2 的 annotation line。
 */
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
    /** 网格自定义（线色 / 虚实 / 线宽 / 纵向网格），与 showGrid 叠加 */
    grid?: GridConfig;
    /** x 轴标签的中心像素位（折线用 xAt、柱状用带中心）；缺省用 xAt */
    xLabelPositions?: number[];
    /** 开启悬浮交互：透明命中列 + 十字准星 + tooltip 气泡 */
    interactive?: boolean;
    /** 命中列悬停时构造 tooltip 内容；返回 null 则只显准星不显气泡 */
    tooltipFor?: (index: number) => TooltipModel | null;
    children: (ctx: PlotCtx) => React.ReactNode;
}
/** 坐标轴 + 网格 + 类目标签的静态帧；mark（线/柱/面）由 children 画在相对容器上。可选悬浮交互。 */
export declare function Plot(props: PlotProps): React.ReactElement;
