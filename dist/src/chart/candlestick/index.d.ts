import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type GridConfig } from '../core/grid';
/** K 线上叠加的折线序列（与 data 等长，价格空间；null 跳过，如均线前几项）。 */
export interface CandleOverlay {
    /** 图例名（如 MA5） */
    name?: string;
    /** 线色（缺省从图表色板取） */
    color?: string;
    /** 线宽 */
    width?: number;
    /** 与 data 等长的数值序列 */
    values: (number | null)[];
}
/** 简单移动平均：对 close 序列取 window 均线，不足窗口的前项返回 null。 */
export declare function movingAverage(values: number[], window: number): (number | null)[];
export interface CandlestickChartProps {
    data: Record<string, any>[];
    /** 时间 / 日期类目字段 */
    xField?: string;
    openField?: string;
    highField?: string;
    lowField?: string;
    closeField?: string;
    /** 成交量字段（给定且 showVolume 时底部画量柱副图） */
    volumeField?: string;
    /** 涨色（默认红，A股「红涨」；传值可切国际「绿涨」） */
    upColor?: string;
    /** 跌色（默认绿） */
    downColor?: string;
    /** 阳线空心（传统 A股画法） */
    hollowUp?: boolean;
    /** 画线样式：candle 蜡烛（默认）/ ohlc 竹线（高低价竖线 + 左开盘右收盘短划） */
    variant?: 'candle' | 'ohlc';
    /** 是否预留并绘制底部时间轴（堆叠多面板时副图下方图关闭以紧贴） */
    showXAxis?: boolean;
    /** 是否显示成交量副图（缺省：给了 volumeField 即显示） */
    showVolume?: boolean;
    height?: number;
    width?: number;
    animation?: boolean;
    animateDuration?: number;
    stagger?: number;
    yFormatter?: (v: number) => string;
    /** 叠加折线（均线等），与 data 等长，共享价格轴 —— K 线与折线重叠 */
    overlays?: CandleOverlay[];
    /** 网格自定义（线色 / 虚实 / 线宽 / 纵向网格） */
    grid?: GridConfig;
    /** 悬浮逐根 tooltip + 竖直准星（默认开） */
    tooltip?: boolean;
    style?: StyleProp<ViewStyle>;
}
export declare function CandlestickChart(props: CandlestickChartProps): React.ReactElement;
export default CandlestickChart;
