/** 单个着色图层：一段 path（可含多条子路径）+ 填充色。tx/ty 保留兼容（生成数据已不再使用）。 */
export interface CoinLayer {
    d: string;
    fill: string;
    tx?: number;
    ty?: number;
}
/** 币种图形定义：viewBox 边长 + 图层（按绘制顺序，后者压前者）。 */
export interface CoinDef {
    vb: number;
    layers: CoinLayer[];
}
/** 全量币种（约 560+，来自 @ant-design/web3 icons）。 */
export declare const COINS: Record<string, CoinDef>;
/**
 * 常见 ticker / 全称 ↔ 文件名基名 的别名桥接（大小写不敏感）。
 * 多数币种文件名基名本身就是 ticker（ada/avax/bnb/link/dot/uni/xrp/matic…），直接精确命中；
 * 这里补齐「全称文件 ↔ 短 ticker」的双向缺口。
 */
export declare const COIN_ALIASES: Record<string, string>;
/** 已内置的规范币种 id 列表（供 demo / 枚举）。 */
export declare const COIN_IDS: string[];
/** 解析任意 symbol/别名到币种定义；未命中返回 undefined。 */
export declare function getCoinDef(symbol: string): CoinDef | undefined;
