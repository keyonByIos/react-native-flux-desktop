"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMOJI_FAMILY = exports.MONO_FAMILY = exports.SANS_FAMILY = void 0;
exports.registerFonts = registerFonts;
exports.resolveFamily = resolveFamily;
exports.fontShorthand = fontShorthand;
// 字体注册：@napi-rs/canvas 的 sans-serif 不含 CJK 字形（中文会画成豆腐块），
// 且各系统默认字体名不同。这里统一注册成 Flux Sans / Flux Sans Bold 两个别名，
// 由 fontWeight 决定取哪个，保证 win / osx 一套代码得到一致的排版结果。
const canvas_1 = require("@napi-rs/canvas");
const REGULAR = 'Flux Sans';
const BOLD = 'Flux Sans Bold';
/** 正文（含 CJK）族名：供需要中文回退的组件（如终端按字符分段选字体）引用 */
exports.SANS_FAMILY = REGULAR;
/** 等宽别名：终端/代码类组件用（由 registerFonts 注册系统真实等宽字体） */
exports.MONO_FAMILY = 'Flux Mono';
/** 彩色 emoji 回退族名：由 registerFonts 注册系统彩色 emoji 字体；fontShorthand 会在任意主字体后追加它 */
exports.EMOJI_FAMILY = 'Flux Emoji';
const CANDIDATES = [
    // Windows：微软雅黑（ttc 里 Regular 与 Bold 是分开的文件，需分别注册）
    { file: 'C:/Windows/Fonts/msyh.ttc', bold: 'C:/Windows/Fonts/msyhbd.ttc' },
    // macOS：苹方
    { file: '/System/Library/Fonts/PingFang.ttc', bold: '/System/Library/Fonts/PingFang.ttc' },
    // Linux 兜底
    { file: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', bold: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' },
];
// 等宽字体候选（终端/代码）：各系统取首个存在的；均不含 CJK，故终端内容以 ASCII 为主
const MONO_CANDIDATES = [
    'C:/Windows/Fonts/consola.ttf', // Windows Consolas
    'C:/Windows/Fonts/CascadiaCode.ttf', // Windows Cascadia Code（新终端）
    'C:/Windows/Fonts/cascadia.ttf',
    '/System/Library/Fonts/Menlo.ttc', // macOS Menlo
    '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', // Linux
];
// 彩色 emoji 字体候选：各系统取首个存在的。@napi-rs/canvas(Skia) 能栅格化其彩色字形表
// （Win COLR 已验证；mac sbix / linux CBDT 待对应环境实测）。字体名含空格，注册别名统一用 EMOJI_FAMILY。
const EMOJI_CANDIDATES = [
    'C:/Windows/Fonts/seguiemj.ttf', // Windows Segoe UI Emoji（COLR 彩色）
    '/System/Library/Fonts/Apple Color Emoji.ttc', // macOS（sbix）
    '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', // Linux Noto（CBDT）
    '/usr/share/fonts/NotoColorEmoji.ttf',
    '/usr/share/fonts/noto/NotoColorEmoji.ttf',
];
let registered = false;
let activeRegular = 'sans-serif';
let activeBold = 'sans-serif';
let activeEmoji = ''; // 注册成功的彩色 emoji 族名；空串表示无（fontShorthand 则不追加回退）
function registerFonts() {
    if (registered)
        return;
    registered = true;
    // 1) 正文（含 CJK）：sans regular + bold
    for (const c of CANDIDATES) {
        try {
            canvas_1.GlobalFonts.registerFromPath(c.file, REGULAR);
            activeRegular = REGULAR;
            if (c.bold && c.bold !== c.file) {
                canvas_1.GlobalFonts.registerFromPath(c.bold, BOLD);
                activeBold = BOLD;
            }
            else {
                activeBold = REGULAR;
            }
            break;
        }
        catch (e) {
            // 该平台字体不存在/不可读，继续试下一个
        }
    }
    if (activeRegular === 'sans-serif')
        console.warn('[flux-skia] no CJK font registered, falling back to sans-serif');
    // 2) 等宽（终端/代码）：注册 Flux Mono；失败则终端回退 monospace（ASCII 内容仍可辨）
    for (const f of MONO_CANDIDATES) {
        try {
            canvas_1.GlobalFonts.registerFromPath(f, exports.MONO_FAMILY);
            break;
        }
        catch (e) {
            // 继续试下一个候选
        }
    }
    // 3) 彩色 emoji 回退族：注册系统彩色 emoji 字体；fontShorthand 会在任意主字体后追加它，
    //    使「CJK/拉丁 + emoji」混排在一次 fillText 内由 Skia 逐字形回退，测量与绘制天然同步。
    for (const f of EMOJI_CANDIDATES) {
        try {
            canvas_1.GlobalFonts.registerFromPath(f, exports.EMOJI_FAMILY);
            activeEmoji = exports.EMOJI_FAMILY;
            break;
        }
        catch (e) {
            // 该平台无此字体/不可读，继续试下一个
        }
    }
}
/** 取当前可用的 family 名；用户显式给了 fontFamily 时优先用它的 */
function resolveFamily(style) {
    const weight = typeof style.fontWeight === 'string' ? parseInt(style.fontWeight, 10) : Number(style.fontWeight);
    const boldish = weight >= 600 || style.fontWeight === 'bold';
    if (style.fontFamily)
        return String(style.fontFamily);
    return boldish ? activeBold : activeRegular;
}
/** CSS font 简写：[@][style] [weight] [size]px family[, emoji 回退族] */
function fontShorthand(style) {
    const size = Number(style.fontSize) || 14;
    const weight = style.fontWeight === undefined ? 'normal' : String(style.fontWeight);
    const italic = style.fontStyle === 'italic' ? 'italic ' : '';
    // 主字体后追加彩色 emoji 回退族：Skia 对缺失字形按列表逐字形回退，emoji 走彩色字体、
    // 其余走主字体；measureText 与 fillText 用同一列表，宽度与绘制一致，无需在文本管线里手工分段。
    const families = activeEmoji ? `"${resolveFamily(style)}", "${activeEmoji}"` : `"${resolveFamily(style)}"`;
    return `${italic}${weight} ${size}px ${families}`;
}
