/** 正文（含 CJK）族名：供需要中文回退的组件（如终端按字符分段选字体）引用 */
export declare const SANS_FAMILY = "Flux Sans";
/** 等宽别名：终端/代码类组件用（由 registerFonts 注册系统真实等宽字体） */
export declare const MONO_FAMILY = "Flux Mono";
/** 彩色 emoji 回退族名：由 registerFonts 注册系统彩色 emoji 字体；fontShorthand 会在任意主字体后追加它 */
export declare const EMOJI_FAMILY = "Flux Emoji";
export declare function registerFonts(): void;
/** 取当前可用的 family 名；用户显式给了 fontFamily 时优先用它的 */
export declare function resolveFamily(style: Record<string, any>): string;
/** CSS font 简写：[@][style] [weight] [size]px family[, emoji 回退族] */
export declare function fontShorthand(style: Record<string, any>): string;
