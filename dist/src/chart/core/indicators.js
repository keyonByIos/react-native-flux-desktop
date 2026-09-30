"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sma = sma;
exports.ema = ema;
exports.macd = macd;
exports.rsi = rsi;
exports.kdj = kdj;
exports.bollinger = bollinger;
// indicators：技术指标纯函数（无渲染关切，输入与 K 线等长的数值序列，输出等长序列；暖机期返回 null）。
// 供 IndicatorChart 副图与 CandlestickChart 的 overlays 复用。约定与业界主流一致：
// - EMA 以首值为种子；MACD 默认 12/26/9，hist = dif - dea；RSI 用 Wilder 平滑；KDJ 默认 9/3/3。
const N = null;
/** 简单移动平均：不足窗口的前 window-1 项为 null。 */
function sma(values, window) {
    const out = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
        if (i >= window)
            sum -= values[i - window];
        out.push(i >= window - 1 ? sum / window : N);
    }
    return out;
}
/** 指数移动平均：以首值种子，k = 2/(window+1)。返回等长 number[]。 */
function ema(values, window) {
    const out = [];
    const k = 2 / (window + 1);
    let prev = values.length ? values[0] : 0;
    for (let i = 0; i < values.length; i++) {
        prev = i === 0 ? values[0] : values[i] * k + prev * (1 - k);
        out.push(prev);
    }
    return out;
}
/** MACD：dif = EMA(fast) - EMA(slow)；dea = EMA(dif, signal)；hist = dif - dea。 */
function macd(closes, fast = 12, slow = 26, signal = 9) {
    const n = closes.length;
    const ef = ema(closes, fast);
    const es = ema(closes, slow);
    const difFull = closes.map((_, i) => ef[i] - es[i]);
    const deaFull = ema(difFull, signal);
    const warm = Math.max(slow, signal);
    const dif = [];
    const dea = [];
    const hist = [];
    for (let i = 0; i < n; i++) {
        const ready = i >= warm - 1;
        dif.push(ready ? difFull[i] : N);
        dea.push(ready ? deaFull[i] : N);
        hist.push(ready ? difFull[i] - deaFull[i] : N);
    }
    return { dif, dea, hist };
}
/** RSI（Wilder 平滑）：默认 period 14，输出 0..100；暖机期 null。 */
function rsi(closes, period = 14) {
    const n = closes.length;
    const out = new Array(n).fill(N);
    if (n <= period)
        return out;
    let gain = 0;
    let loss = 0;
    for (let i = 1; i <= period; i++) {
        const d = closes[i] - closes[i - 1];
        if (d >= 0)
            gain += d;
        else
            loss -= d;
    }
    let ag = gain / period;
    let al = loss / period;
    out[period] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    for (let i = period + 1; i < n; i++) {
        const d = closes[i] - closes[i - 1];
        const g = d > 0 ? d : 0;
        const l = d < 0 ? -d : 0;
        ag = (ag * (period - 1) + g) / period;
        al = (al * (period - 1) + l) / period;
        out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    }
    return out;
}
/** KDJ：RSV 基于 n 周期最高/最低；K=2/3·prevK+1/3·RSV，D=2/3·prevD+1/3·K，J=3K-2D。默认 9/3/3。 */
function kdj(rows, n = 9, m1 = 3, m2 = 3) {
    const len = rows.length;
    const k = new Array(len).fill(N);
    const d = new Array(len).fill(N);
    const j = new Array(len).fill(N);
    let pk = 50;
    let pd = 50;
    for (let i = 0; i < len; i++) {
        if (i < n - 1)
            continue;
        let hh = -Infinity;
        let ll = Infinity;
        for (let jj = i - n + 1; jj <= i; jj++) {
            hh = Math.max(hh, rows[jj].high);
            ll = Math.min(ll, rows[jj].low);
        }
        const rsv = hh === ll ? 50 : ((rows[i].close - ll) / (hh - ll)) * 100;
        const ck = ((m1 - 1) / m1) * pk + (1 / m1) * rsv;
        const cd = ((m2 - 1) / m2) * pd + (1 / m2) * ck;
        k[i] = ck;
        d[i] = cd;
        j[i] = 3 * ck - 2 * cd;
        pk = ck;
        pd = cd;
    }
    return { k, d, j };
}
/** 布林带：mid = SMA(window)；上/下轨 = mid ± mult·标准差。默认 20/2。 */
function bollinger(closes, window = 20, mult = 2) {
    const n = closes.length;
    const mid = sma(closes, window);
    const upper = new Array(n).fill(N);
    const lower = new Array(n).fill(N);
    for (let i = window - 1; i < n; i++) {
        let sum = 0;
        for (let jj = i - window + 1; jj <= i; jj++)
            sum += closes[jj];
        const mean = sum / window;
        let sq = 0;
        for (let jj = i - window + 1; jj <= i; jj++)
            sq += (closes[jj] - mean) ** 2;
        const sd = Math.sqrt(sq / window);
        upper[i] = mean + mult * sd;
        lower[i] = mean - mult * sd;
    }
    return { mid, upper, lower };
}
