"use strict";
// 数据整理：把 @ant-design/charts 风格的扁平行表（data + xField + yField + 可选 seriesField）
// 归一成「类目轴 + 若干对齐序列」，供 line/area/column 共用。缺失点记 null（折线跳过、柱当 0）。
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = prepare;
exports.flatPairs = flatPairs;
exports.maxValue = maxValue;
function prepare(data, xField, yField, seriesField) {
    const categories = [];
    const catIdx = new Map();
    const seriesOrder = [];
    const map = new Map();
    const idxOf = (c) => {
        let i = catIdx.get(c);
        if (i === undefined) {
            i = categories.length;
            catIdx.set(c, i);
            categories.push(c);
        }
        return i;
    };
    for (const row of data) {
        const c = String(row[xField]);
        const ci = idxOf(c);
        const sName = seriesField ? String(row[seriesField]) : yField;
        if (!map.has(sName)) {
            map.set(sName, []);
            seriesOrder.push(sName);
        }
        const arr = map.get(sName);
        // 补齐到当前类目索引
        while (arr.length <= ci)
            arr.push(null);
        const v = row[yField];
        arr[ci] = typeof v === 'number' && Number.isFinite(v) ? v : null;
    }
    // 统一各序列长度到 categories 长度
    const series = seriesOrder.map((name) => {
        const pts = map.get(name);
        while (pts.length < categories.length)
            pts.push(null);
        return { name, points: pts };
    });
    return { categories, series };
}
/** 单序列扁平图（pie/bar 类目即 data 行）：直接取 xField=标签、yField=值。 */
function flatPairs(data, labelField, valueField) {
    return data.map((row) => ({ label: String(row[labelField]), value: Number(row[valueField]) || 0 }));
}
/** 序列在类目上的最大值（用于 y 轴定标）。 */
function maxValue(prep) {
    let m = 0;
    for (const s of prep.series)
        for (const p of s.points)
            if (p != null && p > m)
                m = p;
    return m;
}
