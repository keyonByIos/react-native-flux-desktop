import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { ImagePreview, type PreviewImage } from './preview';
export interface ImageProps {
    src: string;
    width?: number | string;
    height?: number | string;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    radius?: number;
    /** circle 圆形 / rounded 圆角（默认）/ square 直角 */
    shape?: 'circle' | 'rounded' | 'square';
    /** 替代文本：空 src 时作为占位说明 */
    alt?: string;
    /** src 为空时渲染的自定义占位 */
    fallback?: React.ReactNode;
    /** 图片底部说明条（半透明压图） */
    caption?: React.ReactNode;
    /** 是否允许点击预览（打开全屏浮层） */
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
