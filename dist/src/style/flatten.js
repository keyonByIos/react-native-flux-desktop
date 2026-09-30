"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenStyle = flattenStyle;
exports.parseDim = parseDim;
exports.toNumber = toNumber;
exports.expandShorthands = expandShorthands;
exports.getRadius = getRadius;
exports.getBorderWidths = getBorderWidths;
exports.getBorderColors = getBorderColors;
exports.normalizeStyle = normalizeStyle;
exports.parseTransform = parseTransform;
/** 把 StyleProp（对象/数组/false/null）递归合并成一个平面对象，后者覆盖前者 */
function flattenStyle(prop) {
    const out = {};
    const walk = (p) => {
        if (!p)
            return;
        if (Array.isArray(p)) {
            for (const item of p)
                walk(item);
            return;
        }
        if (typeof p === 'object')
            Object.assign(out, p);
    };
    walk(prop);
    return out;
}
/** 数值或百分比字符串 → { value, unit }；'auto'/undefined → null */
function parseDim(v) {
    if (v === undefined || v === null || v === 'auto')
        return null;
    if (typeof v === 'number')
        return { value: v, percent: false };
    const s = String(v).trim();
    if (s.endsWith('%')) {
        const n = parseFloat(s);
        return Number.isFinite(n) ? { value: n, percent: true } : null;
    }
    const n = parseFloat(s);
    return Number.isFinite(n) ? { value: n, percent: false } : null;
}
function toNumber(v, fallback = 0) {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : fallback;
}
/** 展开 padding/margin 的 all / Horizontal / Vertical 三级简写 */
function expandShorthands(style) {
    const s = { ...style };
    const apply = (base) => {
        if (s[base] !== undefined) {
            for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
                if (s[base + side] === undefined)
                    s[base + side] = s[base];
            }
        }
        if (s[base + 'Horizontal'] !== undefined) {
            if (s[base + 'Left'] === undefined)
                s[base + 'Left'] = s[base + 'Horizontal'];
            if (s[base + 'Right'] === undefined)
                s[base + 'Right'] = s[base + 'Horizontal'];
        }
        if (s[base + 'Vertical'] !== undefined) {
            if (s[base + 'Top'] === undefined)
                s[base + 'Top'] = s[base + 'Vertical'];
            if (s[base + 'Bottom'] === undefined)
                s[base + 'Bottom'] = s[base + 'Vertical'];
        }
    };
    apply('padding');
    apply('margin');
    return s;
}
/** 圆角归一：支持 number 与 {topLeft,...} 对象两种 RN 写法 */
function getRadius(s) {
    const r = s.borderRadius;
    if (r && typeof r === 'object') {
        return {
            tl: toNumber(r.topLeft),
            tr: toNumber(r.topRight),
            br: toNumber(r.bottomRight),
            bl: toNumber(r.bottomLeft),
        };
    }
    const n = toNumber(r);
    return {
        tl: toNumber(s.borderTopLeftRadius, n),
        tr: toNumber(s.borderTopRightRadius, n),
        br: toNumber(s.borderBottomRightRadius, n),
        bl: toNumber(s.borderBottomLeftRadius, n),
    };
}
/** 边框宽度归一：borderWidth 为基准，单边可覆盖 */
function getBorderWidths(s) {
    const bw = toNumber(s.borderWidth);
    return {
        top: toNumber(s.borderTopWidth, bw),
        right: toNumber(s.borderRightWidth, bw),
        bottom: toNumber(s.borderBottomWidth, bw),
        left: toNumber(s.borderLeftWidth, bw),
    };
}
/** 边框颜色归一：borderColor 为基准，单边可覆盖（Card 头尾分隔线就靠这个） */
function getBorderColors(s) {
    const base = s.borderColor;
    return {
        top: s.borderTopColor ?? base,
        right: s.borderRightColor ?? base,
        bottom: s.borderBottomColor ?? base,
        left: s.borderLeftColor ?? base,
    };
}
/** 完整归一化入口：flatten → 展开简写 */
function normalizeStyle(prop) {
    return expandShorthands(flattenStyle(prop));
}
const IDENTITY = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
/** A·B（先应用 B 再应用 A） */
function mulMat(A, B) {
    return {
        a: A.a * B.a + A.c * B.b,
        b: A.b * B.a + A.d * B.b,
        c: A.a * B.c + A.c * B.d,
        d: A.b * B.c + A.d * B.d,
        e: A.a * B.e + A.c * B.f + A.e,
        f: A.b * B.e + A.d * B.f + A.f,
    };
}
/** '45deg' | '0.7rad' | 45 → 度 */
function toDeg(v) {
    if (typeof v === 'number')
        return v;
    const s = String(v).trim();
    if (s.endsWith('rad'))
        return (parseFloat(s) * 180) / Math.PI;
    return parseFloat(s) || 0;
}
/** 长度：数字直接用作 px；'50%' 相对给定基准维度 */
function toLen(v, dim) {
    if (typeof v === 'number')
        return v;
    const s = String(v).trim();
    if (s.endsWith('%'))
        return (parseFloat(s) / 100) * dim;
    return parseFloat(s) || 0;
}
/** 解析 transformOrigin → 盒内局部原点（未加 boxX/boxY），默认居中 */
function parseOrigin(s, w, h) {
    let ox = w / 2;
    let oy = h / 2;
    if (typeof s === 'string' && s.trim()) {
        const toks = s.trim().toLowerCase().split(/\s+/);
        const rx = (t, dim) => {
            if (t === 'left' || t === 'top')
                return 0;
            if (t === 'right' || t === 'bottom')
                return dim;
            if (t === 'center')
                return dim / 2;
            if (t.endsWith('%'))
                return (parseFloat(t) / 100) * dim;
            return parseFloat(t) || 0;
        };
        if (toks.length === 1) {
            if (toks[0] === 'top' || toks[0] === 'bottom')
                oy = rx(toks[0], h);
            else
                ox = rx(toks[0], w);
        }
        else {
            ox = rx(toks[0], w);
            oy = rx(toks[1], h);
        }
    }
    return { x: ox, y: oy };
}
/**
 * 把 style.transform 解析成作用于绝对坐标系的最终矩阵。
 * 无 transform / 单位变换返回 null（painter 走快速路径，零开销）。
 */
function parseTransform(s, w, h, boxX, boxY) {
    const list = s.transform;
    if (!Array.isArray(list) || list.length === 0)
        return null;
    let P = { ...IDENTITY };
    for (const op of list) {
        if (!op || typeof op !== 'object')
            continue;
        const k = Object.keys(op)[0];
        const v = op[k];
        let M = null;
        switch (k) {
            case 'translateX':
                M = { a: 1, b: 0, c: 0, d: 1, e: toLen(v, w), f: 0 };
                break;
            case 'translateY':
                M = { a: 1, b: 0, c: 0, d: 1, e: 0, f: toLen(v, h) };
                break;
            case 'scale': {
                const n = toNumber(v, 1);
                M = { a: n, b: 0, c: 0, d: n, e: 0, f: 0 };
                break;
            }
            case 'scaleX':
                M = { a: toNumber(v, 1), b: 0, c: 0, d: 1, e: 0, f: 0 };
                break;
            case 'scaleY':
                M = { a: 1, b: 0, c: 0, d: toNumber(v, 1), e: 0, f: 0 };
                break;
            case 'rotate': {
                const r = (toDeg(v) * Math.PI) / 180;
                const cs = Math.cos(r);
                const sn = Math.sin(r);
                M = { a: cs, b: sn, c: -sn, d: cs, e: 0, f: 0 };
                break;
            }
            case 'skewX': {
                const t = Math.tan((toDeg(v) * Math.PI) / 180);
                M = { a: 1, b: t, c: 0, d: 1, e: 0, f: 0 };
                break;
            }
            case 'skewY': {
                const t = Math.tan((toDeg(v) * Math.PI) / 180);
                M = { a: 1, b: 0, c: t, d: 1, e: 0, f: 0 };
                break;
            }
            default:
                M = null;
        }
        if (M)
            P = mulMat(P, M);
    }
    if (P.a === 1 && P.b === 0 && P.c === 0 && P.d === 1 && P.e === 0 && P.f === 0)
        return null;
    const local = parseOrigin(s.transformOrigin, w, h);
    const Ox = boxX + local.x;
    const Oy = boxY + local.y;
    // M_total = T(O)·P·T(-O)（闭式）
    return {
        a: P.a,
        b: P.b,
        c: P.c,
        d: P.d,
        e: P.e + Ox * (1 - P.a) - P.c * Oy,
        f: P.f + Oy * (1 - P.d) - P.b * Ox,
    };
}
