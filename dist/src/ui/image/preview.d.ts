import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PreviewImage {
    src: string;
    alt?: string;
}
export interface ImagePreviewProps {
    visible?: boolean;
    /** 图片列表（支持多图切换） */
    images?: PreviewImage[];
    /** 当前索引（受控） */
    current?: number;
    onCurrentChange?: (index: number) => void;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
}
export declare function ImagePreview(props: ImagePreviewProps): React.ReactElement | null;
export default ImagePreview;
