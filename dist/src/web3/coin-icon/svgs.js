"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COIN_IDS = exports.COIN_ALIASES = exports.COINS = void 0;
exports.getCoinDef = getCoinDef;
// web3 币种图标数据入口：合并「自动生成」的 @ant-design/web3 全量币种 + 手工别名表。
// 归一化约定见 coins-data.ts 头注释：vb=max(宽高)、变换与居中已烘焙进绝对坐标、同色路径已合并。
const coins_data_1 = require("./coins-data");
/** 全量币种（约 560+，来自 @ant-design/web3 icons）。 */
exports.COINS = coins_data_1.GENERATED_COINS;
/**
 * 常见 ticker / 全称 ↔ 文件名基名 的别名桥接（大小写不敏感）。
 * 多数币种文件名基名本身就是 ticker（ada/avax/bnb/link/dot/uni/xrp/matic…），直接精确命中；
 * 这里补齐「全称文件 ↔ 短 ticker」的双向缺口。
 */
exports.COIN_ALIASES = {
    btc: 'bitcoin', xbt: 'bitcoin',
    eth: 'ethereum', ether: 'ethereum',
    sol: 'solana',
    doge: 'dogecoin',
    ltc: 'litecoin',
    trx: 'tron',
    dot: 'polkadot',
    link: 'chainlink',
    uni: 'uniswap',
    ada: 'cardano',
    avax: 'avalanche',
    xrp: 'ripple',
    matic: 'polygon', pol: 'polygon',
    bnb: 'binancecoin',
    ton: 'toncoin',
    usdt: 'tether',
    near: 'nearprotocol',
    apt: 'aptos',
    atom: 'cosmos',
    op: 'optimism',
    arb: 'arbitrum',
    ftm: 'fantom',
    hbar: 'hedera',
    icp: 'internet-computer',
    fil: 'filecoin',
    etc: 'ethereumclassic',
    bsy: 'biswap',
    // 反向：全称 → 短 ticker（若文件名用的是 ticker）
    bitcoin: 'bitcoin', ethereum: 'ethereum', solana: 'solana', dogecoin: 'dogecoin',
    cardano: 'ada', polkadot: 'dot', chainlink: 'link', uniswap: 'uni', avalanche: 'avax',
    polygon: 'matic', tron: 'trx', litecoin: 'ltc', ripple: 'xrp', binancecoin: 'bnb',
    tether: 'usdt', toncoin: 'ton', cosmos: 'atom', aptos: 'apt', optimism: 'op', arbitrum: 'arb',
};
/** 已内置的规范币种 id 列表（供 demo / 枚举）。 */
exports.COIN_IDS = Object.keys(exports.COINS);
/** 归一化：去空白、小写、去掉分隔符，便于宽松匹配。 */
function norm(s) {
    return (s || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
}
// 预建宽松索引：norm(id) → id，以及 norm(alias) → target
const LOOSE = {};
for (const id of exports.COIN_IDS) {
    if (!LOOSE[norm(id)])
        LOOSE[norm(id)] = id;
}
/** 解析任意 symbol/别名到币种定义；未命中返回 undefined。 */
function getCoinDef(symbol) {
    const raw = (symbol || '').trim().toLowerCase();
    if (!raw)
        return undefined;
    // 1) 精确命中文件名基名
    if (exports.COINS[raw])
        return exports.COINS[raw];
    // 2) 别名表
    const aliased = exports.COIN_ALIASES[raw];
    if (aliased && exports.COINS[aliased])
        return exports.COINS[aliased];
    // 3) 宽松命中（忽略大小写/分隔符）
    const looseId = LOOSE[norm(raw)];
    if (looseId && exports.COINS[looseId])
        return exports.COINS[looseId];
    const looseAlias = LOOSE[norm(aliased || '')];
    if (looseAlias && exports.COINS[looseAlias])
        return exports.COINS[looseAlias];
    return undefined;
}
