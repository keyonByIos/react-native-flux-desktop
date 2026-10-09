import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
/** 连接线外观配置 */
export interface StepsLineConfig {
    /** 线型：实线 / 虚线 / 点线。默认 solid */
    style?: 'solid' | 'dashed' | 'dotted';
    /** 粗细。默认 token.lineWidth */
    width?: number;
    /** 未完成轨道色。默认 token.colorBorderSecondary */
    color?: string;
    /** 已完成填充色。默认 token.colorPrimary */
    activeColor?: string;
    /** 线与节点之间的留白。默认 token.marginXS */
    gap?: number;
}
export interface StepItem {
    key?: string | number;
    title?: React.ReactNode;
    description?: React.ReactNode;
    subTitle?: React.ReactNode;
    status?: StepStatus;
    /** 自定义图标节点：传入后替换序号圆点 */
    icon?: React.ReactNode;
    /** 禁用（不可点击） */
    disabled?: boolean;
}
export interface StepsProps {
    current?: number;
    /** 起始序号偏移（items 从 1+initial 开始编号） */
    initial?: number;
    items?: StepItem[];
    status?: 'process' | 'error' | 'finish';
    size?: 'default' | 'small';
    direction?: 'horizontal' | 'vertical';
    /** 横向时标题位置：horizontal=标题在圆点右侧；vertical=标题在圆点下方 */
    labelPlacement?: 'horizontal' | 'vertical';
    /** 点状步骤条：以小圆点替代序号圆圈 */
    progressDot?: boolean;
    /** 只读：禁用点击 */
    readOnly?: boolean;
    /** 序号模式：完成态也渲染序号而非对勾（白字置于主色实心圆上），用于展示固定流程步骤 */
    showNumber?: boolean;
    onChange?: (current: number) => void;
    /** 连接线外观：样式 / 颜色 / 粗细 / 与节点留白 */
    line?: StepsLineConfig;
    style?: StyleProp<ViewStyle>;
}
export declare function Steps(props: StepsProps): React.ReactElement;
