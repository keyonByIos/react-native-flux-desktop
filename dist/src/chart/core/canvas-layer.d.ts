import React from 'react';
import { StyleProp, ViewStyle } from '../../types';

export type DrawFn = (ctx: any, w: number, h: number, dpr: number) => void;
export interface CanvasLayerProps {

    width: number;

    height: number;

    draw: DrawFn;

    deps: React.DependencyList;

    style?: StyleProp<ViewStyle>;
}

export declare function CanvasLayer(props: CanvasLayerProps): React.ReactElement;
export default CanvasLayer;
