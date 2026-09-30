import React from 'react';
/** 网格自定义配置：所有图表共享的一组开关。 */
export interface GridConfig {
    /** 是否显示网格（默认 true） */
    show?: boolean;
    /** 网格线色（默认取图表皮肤 theme.gridLine） */
    color?: string;
    /** 虚线（默认 false 实线） */
    dashed?: boolean;
    /** 线宽 px（默认 1） */
    thickness?: number;
    /** 附加纵向（类目方向）网格线，默认 false；供折线/柱状等竖向图按需开启 */
    vertical?: boolean;
}
export interface GridLinesProps {
    /** 绘图区矩形（绝对像素），横线铺满 width、竖线铺满 height */
    area: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    /** 横向网格线的 y 像素位 */
    horizontal?: number[];
    /** 纵向网格线的 x 像素位 */
    vertical?: number[];
    /** 自定义配置 */
    config?: GridConfig;
    /** 缺省线色（一般传 theme.gridLine） */
    fallbackColor?: string;
}
/** 按给定像素位渲染横/纵网格线；config.show=false 时整体不画。须放在一个 position:relative 容器内。 */
export declare function GridLines(props: GridLinesProps): React.ReactElement;
export default GridLines;
