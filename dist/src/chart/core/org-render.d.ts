import type { OrgEdge, OrgNodeBox } from './org-layout';
export interface DrawOrgOptions {
    nodeStyle: 'simple' | 'card';
    direction: 'vertical' | 'horizontal';
    fontFamily: string;
    /** simple 块字号 */
    fontSize: number;
    /** 卡片姓名/职务字号 */
    nameFont: number;
    subFont: number;
    primary: string;
    edgeColor: string;
    /** 卡片固定配色（浅色主题画布上恒白底，与 flow 同理） */
    cardBg: string;
    cardBorder: string;
    nameColor: string;
    subColor: string;
    lineWidth: number;
    /** 入场淡入 0→1 */
    reveal: number;
}
/** 主入口：先边后节点。清空由 CanvasLayer 负责。 */
export declare function drawOrg(ctx: any, boxes: OrgNodeBox[], edges: OrgEdge[], opts: DrawOrgOptions): void;
