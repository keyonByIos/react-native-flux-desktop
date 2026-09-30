import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { ImagePreview, type PreviewImage } from './preview';
export interface ImageProps {
    src: string;
    width?: number | string;
    height?: number | string;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    radius?: number;

    shape?: 'circle' | 'rounded' | 'square';

    alt?: string;

    fallback?: React.ReactNode;

    caption?: React.ReactNode;

    preview?: boolean | {
        images?: PreviewImage[];
    };
    style?: StyleProp<ViewStyle>;
}
export interface ImageBoxComp {
    (props: ImageProps): React.ReactElement;
    Preview: typeof ImagePreview;
}
export declare const ImageBox: ImageBoxComp;
export default ImageBox;
