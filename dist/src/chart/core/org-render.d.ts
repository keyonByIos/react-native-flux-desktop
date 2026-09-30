import type { OrgEdge, OrgNodeBox } from './org-layout';
export interface DrawOrgOptions {
    nodeStyle: 'simple' | 'card';
    direction: 'vertical' | 'horizontal';
    fontFamily: string;

    fontSize: number;

    nameFont: number;
    subFont: number;
    primary: string;
    edgeColor: string;

    cardBg: string;
    cardBorder: string;
    nameColor: string;
    subColor: string;
    lineWidth: number;

    reveal: number;
}

export declare function drawOrg(ctx: any, boxes: OrgNodeBox[], edges: OrgEdge[], opts: DrawOrgOptions): void;
