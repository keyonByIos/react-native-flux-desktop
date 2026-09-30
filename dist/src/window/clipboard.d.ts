/** 读系统剪贴板文本；无内容/不支持返回空串 */
export declare function readClipboard(): string;
/** 写系统剪贴板文本；返回是否成功 */
export declare function writeClipboard(text: string): boolean;
