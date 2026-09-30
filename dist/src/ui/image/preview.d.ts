import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
export interface PreviewImage {
    src: string;
    alt?: string;
}
export interface ImagePreviewProps {
    visible?: boolean;

    images?: PreviewImage[];

    current?: number;
    onCurrentChange?: (index: number) => void;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
}
export declare function ImagePreview(props: ImagePreviewProps): React.ReactElement | null;
export default ImagePreview;
