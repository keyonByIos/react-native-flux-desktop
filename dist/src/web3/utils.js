"use strict";
// web3 共享纯工具：地址截断、确定性哈希、HSL→hex、Blockies 像素头像、金额格式化。
// 全是无副作用的展示辅助，供 Address / TokenPrice / PriceRange / NFTCard / Web3Avatar 复用。
Object.defineProperty(exports, "__esModule", { value: true });
exports.fnvHash = fnvHash;
exports.prng = prng;
exports.truncateAddress = truncateAddress;
exports.hslToHex = hslToHex;
exports.blockies = blockies;
exports.formatAmount = formatAmount;
exports.formatPercent = formatPercent;
/** FNV-1a：字符串 → 32 位无符号整数（确定性，供头像/配色取种子）。 */
function fnvHash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
}
/** mulberry32：由 seed 产出 [0,1) 确定性伪随机序列（Blockies 逐格取色）。 */
function prng(seed) {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
/** 截断地址：0x1234abcd…ef56（默认保留头 6 尾 4，含 0x）。 */
function truncateAddress(address, lead = 6, trail = 4) {
    if (!address)
        return '';
    const s = address.trim();
    if (s.length <= lead + trail + 1)
        return s;
    return `${s.slice(0, lead)}…${s.slice(s.length - trail)}`;
}
/** HSL → #rrggbb。h∈[0,360) s/l∈[0,1]。 */
function hslToHex(h, s, l) {
    const hh = ((h % 360) + 360) % 360;
    const cc = (1 - Math.abs(2 * l - 1)) * s;
    const x = cc * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = l - cc / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (hh < 60)
        [r, g, b] = [cc, x, 0];
    else if (hh < 120)
        [r, g, b] = [x, cc, 0];
    else if (hh < 180)
        [r, g, b] = [0, cc, x];
    else if (hh < 240)
        [r, g, b] = [0, x, cc];
    else if (hh < 300)
        [r, g, b] = [x, 0, cc];
    else
        [r, g, b] = [cc, 0, x];
    const to = (n) => Math.round((n + m) * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`;
}
/**
 * 由地址（或任意字符串）确定性生成 8×8 像素身份图案（Ethereum Blockies 风格）。
 * 只取左半 + 镜像到右半 → 左右对称；三档配色由哈希派生。
 */
function blockies(seed, size = 8) {
    const rand = prng(fnvHash(seed || 'flux-web3'));
    const hue = rand() * 360;
    const sat = 0.5 + rand() * 0.4;
    const color = hslToHex(hue, sat, 0.42);
    const bgColor = hslToHex(hue, sat * 0.6, 0.92);
    const spotColor = hslToHex((hue + 40) % 360, sat, 0.55);
    const half = Math.ceil(size / 2);
    const shade = Array.from({ length: size }, () => Array(size).fill(0));
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < half; c++) {
            const v = rand();
            const cell = v < 0.45 ? 0 : v < 0.82 ? 1 : 2;
            shade[r][c] = cell;
            shade[r][size - 1 - c] = cell; // 镜像
        }
    }
    const cells = shade.map((row) => row.map((v) => v !== 0));
    return { size, color, bgColor, spotColor, cells, shade };
}
/** 千分位 + 固定小数位。value 非有限值时返回占位。 */
function formatAmount(value, precision = 2) {
    if (!Number.isFinite(value))
        return '–';
    return value.toLocaleString('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    });
}
/** 涨跌幅文案：+3.21% / -1.00%，带符号。 */
function formatPercent(value, precision = 2) {
    if (!Number.isFinite(value))
        return '–';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(precision)}%`;
}
