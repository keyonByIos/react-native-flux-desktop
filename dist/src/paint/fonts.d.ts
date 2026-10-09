/** 正文（含 CJK）族名：供需要中文回退的组件（如终端按字符分段选字体）引用 */
export declare const SANS_FAMILY = "Flux Sans";
/** 等宽别名：终端/代码类组件用（由 registerFonts 注册系统真实等宽字体） */
export declare const MONO_FAMILY = "Flux Mono";
/** 彩色 emoji 回退族名：由 registerFonts 注册系统彩色 emoji 字体；fontShorthand 会在任意主字体后追加它 */
export declare const EMOJI_FAMILY = "Flux Emoji";
export declare function registerFonts(): void;
/**
 * 取当前可用的 family 名；用户显式给了 fontFamily 时优先用它（含粗体则尝试其 Bold 变体），
 * 否则回落到「全局默认族」（内置 CJK 锚点，或被 FLUX_DEFAULT_FAMILY 改写后的用户族）。
 */
export declare function resolveFamily(style: Record<string, any>): string;
/** CSS font 简写：[@][style] [weight] [size]px "主族", "CJK 兜底", "emoji 兜底" */
export declare function fontShorthand(style: Record<string, any>): string;
/** 本次运行可用的字体族名（内置 + app.json 注册成功的用户族）：供字体选择器列出。 */
export declare function listFontFamilies(): string[];
