import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface CarouselProps {

    slides: React.ReactNode[];

    autoPlay?: number;

    arrows?: boolean;

    dots?: boolean;

    dotPosition?: 'top' | 'bottom' | 'left' | 'right';

    infinite?: boolean;

    activeIndex?: number;
    defaultActiveIndex?: number;
    onChange?: (i: number) => void;
    height?: number;

    preload?: string[];
    style?: StyleProp<ViewStyle>;
}
export declare function Carousel(props: CarouselProps): React.ReactElement;
export default Carousel;
