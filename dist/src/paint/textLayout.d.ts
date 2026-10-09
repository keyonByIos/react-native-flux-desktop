/** 把文本切成断行单元：CJK 单字、拉丁单词、空白、换行 */
export declare function tokenize(text: string): string[];
export declare function lineHeightOf(style: Record<string, any>): number;
export interface TextLine {
    text: string;
    width: number;
}
export interface TextLayout {
    lines: TextLine[];
    lineHeight: number;
    /** 排版后的自然宽度（最长行）——喂给 Yoga 当 intrinsic width */
    maxWidth: number;
    /** 总高度 = 行数 × 行高 */
    height: number;
    truncated: boolean;
}
export declare function textWidth(ctx: any, text: string): number;
/**
 * 换行排版。
 * @param availWidth 可用宽度；Infinity 表示不约束（单行按内容展开）
 * @param maxLines   numberOfLines；undefined/0 表示不限
 */
export declare function layoutText(rawText: string, style: Record<string, any>, availWidth?: number, maxLines?: number, preserveSpace?: boolean): TextLayout;
/**
 * 给 Yoga measure 用：在父级约束下算文本占位。
 * 必须区分 MeasureMode——AtMost 下假设「填满约束」会让文本谎报宽度，
 * 父容器就会按错误宽度算行数，表现为文字溢出卡片。
 * @param widthMode 0=Undefined 1=Exactly 2=AtMost（与 Yoga MeasureMode 一致）
 */
export declare function measureTextBlock(rawText: string, style: Record<string, any>, availWidth: number, widthMode: number, maxLines?: number, preserveSpace?: boolean): {
    width: number;
    height: number;
};
/** 单行（不换行）文本宽度：Input 光标水平定位、滚动估算用 */
export declare function measureSingleLineWidth(text: string, style: Record<string, any>): number;
/**
 * 点击落位：给定整段文本与从内容盒左边算起的逻辑 x，返回最近的光标索引（按码点，0..len）。
 * 逐前缀测宽取最接近 x 的切点；对 ASCII 输入足够精确，CJK 也按字宽近似可接受。
 */
export declare function caretIndexAtX(text: string, style: Record<string, any>, x: number): number;
/** 一条可视行：源码中 [start,end) 码点区间（不含尾部换行符）渲染在本行 */
export interface WrappedLine {
    start: number;
    end: number;
    text: string;
    width: number;
    /** 该行是否以硬换行(\n)或文本结尾收来束（区别于软换行断开） */
    hard: boolean;
}
/**
 * 将文本按 availWidth 软换行（\n 为硬断），返回每可视行的码点区间。
 * @param availWidth 可用宽度；Infinity 表示按内容展开（只受 \n 分行）
 */
export declare function wrapText(rawText: string, style: Record<string, any>, availWidth: number): WrappedLine[];
