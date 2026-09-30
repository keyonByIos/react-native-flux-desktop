import React from 'react';
import { StyleProp, ViewStyle } from '../../types';
import { type IconName, type IconMode } from './paths';
export type { IconName, IconMode } from './paths';
export { iconPaths, getIconDef } from './paths';
export interface IconProps {

    name?: IconName | string;

    path?: string;

    vb?: number;

    size?: number;

    color?: string;

    strokeWidth?: number;

    rotate?: number;

    mode?: IconMode;

    animate?: 'spin' | 'breath';

    animateDuration?: number;

    style?: StyleProp<ViewStyle>;
}
export declare function Icon(props: IconProps): React.ReactElement;
export default Icon;
