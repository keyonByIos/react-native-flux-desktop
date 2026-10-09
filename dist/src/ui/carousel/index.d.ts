import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CarouselProps {
    /** 每一屏的内容节点 */
    slides: React.ReactNode[];
    /** 自动播放间隔（ms）；0 关闭 */
    autoPlay?: number;
    /** 是否显示左右箭头 */
    arrows?: boolean;
    /** 是否显示指示圆点 */
    dots?: boolean;
    /** 圆点位置 */
    dotPosition?: 'top' | 'bottom' | 'left' | 'right';
    /** 是否循环（false 时到两端不循环且隐藏对应箭头） */
    infinite?: boolean;
    /** 受控 */
    activeIndex?: number;
    defaultActiveIndex?: number;
    onChange?: (i: number) => void;
    height?: number;
    /** 需预加载的图片 uri 列表：挂载即解码入缓存，切换/轮播到对应屏时无留白 */
    preload?: string[];
    style?: StyleProp<ViewStyle>;
}
export declare function Carousel(props: CarouselProps): React.ReactElement;
export default Carousel;
