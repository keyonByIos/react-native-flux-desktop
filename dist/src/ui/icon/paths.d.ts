export type IconMode = 'stroke' | 'fill';
export interface IconDef {
    /** 一段或多段子路径拼成的 SVG path data */
    d: string;
    /** 渲染模式，默认 stroke */
    mode?: IconMode;
}
/** 画布网格边长，所有图标都以此为坐标系 */
export declare const ICON_VIEWBOX = 24;
export declare const iconPaths: Record<string, IconDef>;
/** 所有合法图标名 */
export type IconName = keyof typeof iconPaths;
/** 取图标定义；未知名返回 undefined */
export declare function getIconDef(name: string): IconDef | undefined;
