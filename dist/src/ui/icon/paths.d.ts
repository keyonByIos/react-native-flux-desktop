export type IconMode = 'stroke' | 'fill';
export interface IconDef {

    d: string;

    mode?: IconMode;
}

export declare const ICON_VIEWBOX = 24;
export declare const iconPaths: Record<string, IconDef>;

export type IconName = keyof typeof iconPaths;

export declare function getIconDef(name: string): IconDef | undefined;
