"use strict";
/**
 * Lightweight color utility (no external deps).
 * Supports hex / rgb(a) / hsl(a) parsing and the operations used by the theme
 * derivation algorithm: darken/lighten mix, alpha compositing and palette gen.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.rgbToHex = rgbToHex;
exports.rgbToHsv = rgbToHsv;
exports.hsvToRgb = hsvToRgb;
exports.mix = mix;
exports.lighten = lighten;
exports.darken = darken;
exports.fade = fade;
exports.transparentColor = transparentColor;
exports.isValidColor = isValidColor;
exports.readability = readability;
exports.generate = generate;
const clamp = (n, min = 0, max = 255) => Math.min(max, Math.max(min, n));
const clamp01 = (n) => Math.min(1, Math.max(0, n));
function hexToRgb(hex) {
    let h = hex.replace('#', '').trim();
    if (h.length === 3 || h.length === 4) {
        h = h
            .split('')
            .map((c) => c + c)
            .join('')
            .slice(0, 6);
    }
    if (h.length !== 6 && h.length !== 8)
        return null;
    const num = parseInt(h.slice(0, 6), 16);
    if (Number.isNaN(num))
        return null;
    return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}
function parse(input) {
    const str = input.trim().toLowerCase();
    if (str.startsWith('#')) {
        return hexToRgb(str) ?? { r: 0, g: 0, b: 0 };
    }
    const rgbMatch = str.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
        const parts = rgbMatch[1].split(/[,/\s]+/).filter(Boolean).map(Number);
        return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0 };
    }
    return { r: 0, g: 0, b: 0 };
}
function rgbToHex({ r, g, b }) {
    const to = (n) => clamp(Math.round(n)).toString(16).padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`;
}
function rgbToHsv(rgb) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r)
            h = ((g - b) / d) % 6;
        else if (max === g)
            h = (b - r) / d + 2;
        else
            h = (r - g) / d + 4;
        h *= 60;
        if (h < 0)
            h += 360;
    }
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
}
function hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0;
    let g = 0;
    let b = 0;
    if (h < 60)
        [r, g, b] = [c, x, 0];
    else if (h < 120)
        [r, g, b] = [x, c, 0];
    else if (h < 180)
        [r, g, b] = [0, c, x];
    else if (h < 240)
        [r, g, b] = [0, x, c];
    else if (h < 300)
        [r, g, b] = [x, 0, c];
    else
        [r, g, b] = [c, 0, x];
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}
/** Mix `color` toward `target` by `p` (0..1). Equivalent to less mix(). */
function mix(color, target, p) {
    const a = parse(color);
    const b = parse(target);
    const t = clamp01(p);
    return rgbToHex({
        r: a.r * (1 - t) + b.r * t,
        g: a.g * (1 - t) + b.g * t,
        b: a.b * (1 - t) + b.b * t,
    });
}
function lighten(color, amount) {
    return mix(color, '#ffffff', amount);
}
function darken(color, amount) {
    return mix(color, '#000000', amount);
}
/** Return an rgba() string with the given alpha. */
function fade(color, alpha) {
    const { r, g, b } = parse(color);
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${clamp01(alpha)})`;
}
/** Composite a translucent foreground over an opaque background. */
function transparentColor(color, alpha, bg) {
    const fg = parse(color);
    const b = parse(bg);
    const a = clamp01(alpha);
    return rgbToHex({
        r: fg.r * a + b.r * (1 - a),
        g: fg.g * a + b.g * (1 - a),
        b: fg.b * a + b.b * (1 - a),
    });
}
function isValidColor(input) {
    if (!input)
        return false;
    const s = input.trim().toLowerCase();
    if (s.startsWith('#'))
        return hexToRgb(s) !== null;
    return /rgba?\(/.test(s);
}
function readability(bg, fg) {
    const lum = (c) => {
        const a = [c.r, c.g, c.b].map((v) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };
    const l1 = lum(parse(bg));
    const l2 = lum(parse(fg));
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
}
/**
 * Generate a 10-level palette (index 0 => level 1 ... index 9 => level 10),
 * mirroring Ant Design's @ant-design/colors algorithm (HSV-based tint/shade).
 */
function generate(color) {
    const base = parse(color);
    const hsv = rgbToHsv(base);
    const hue = hsv.h;
    const levels = 10;
    const palette = [];
    // level 6 (index 5) is the base color; 1..5 lighten toward white,
    // 7..10 darken toward black, with gentle saturation ramps for a natural feel.
    for (let i = 1; i <= levels; i++) {
        if (i === 6) {
            palette.push(rgbToHex(base));
            continue;
        }
        const dist = i < 6 ? 6 - i : i - 6;
        let lightness;
        let saturation;
        if (i < 6) {
            lightness = clamp01(hsv.v + (1 - hsv.v) * (dist / 6) * 0.9);
            saturation = clamp01(hsv.s - hsv.s * (dist / 10) * 0.85);
        }
        else {
            lightness = clamp01(hsv.v - hsv.v * (dist / 10) * 0.9);
            saturation = clamp01(hsv.s + (1 - hsv.s) * (dist / 12) * 0.6);
        }
        const rgb = hsvToRgb(hue, saturation, lightness);
        palette.push(rgbToHex(rgb));
    }
    return palette;
}
