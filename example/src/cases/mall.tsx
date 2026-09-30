// 案例 / 商城首页 Mall Shop：零新增原子件的整页组合——纯用既有组件拼一个可交互电商首页。
// 结构（自上而下）：搜索栏 + 购物车入口 → 促销轮播 → 热门分类宫格 → 限时秒杀 → 精选商品网格（分类/搜索过滤）→ 购物车抽屉。
// 整洁约束：区块统一 Card 承载、同排卡片等高（行直接子项 + alignItems:stretch）、文字短不溢出、间距全走 token。
import React from 'react';
import {
  View, Text, ImageBox, Pressable, Card, Tag, Button, Badge, Search, Carousel,
  Segmented, CountDown, Rate, Progress, InputNumber, Message, Empty, Icon,
  useToken, type MessageType,
} from 'react-native-flux-desktop';
import { fade } from 'react-native-flux-desktop';

/* ────────────────────────── 静态数据 ────────────────────────── */

interface Cat { icon: string; label: string; color: string }
const CATS: Cat[] = [
  { icon: 'smartphone', label: '手机数码', color: '#2f54eb' },
  { icon: 'laptop', label: '电脑办公', color: '#13c2c2' },
  { icon: 'tv', label: '家用电器', color: '#722ed1' },
  { icon: 'shoppingBag', label: '服饰鞋包', color: '#eb2f96' },
  { icon: 'droplet', label: '美妆护肤', color: '#f5222d' },
  { icon: 'gift', label: '食品生鲜', color: '#fa8c16' },
  { icon: 'activity', label: '运动户外', color: '#52c41a' },
  { icon: 'home', label: '家居家装', color: '#faad14' },
  { icon: 'smile', label: '母婴玩具', color: '#ff7875' },
  { icon: 'film', label: '影音娱乐', color: '#08979c' },
];

type Group = '数码' | '服饰' | '家居' | '美妆';
interface Goods { id: number; name: string; sub: string; group: Group; price: number; old: number; rate: number; sold: string; tag?: string }
const GOODS: Goods[] = [
  { id: 1, name: '降噪耳机 Pro', sub: '42dB 主动降噪 · 30h 续航', group: '数码', price: 499, old: 699, rate: 4.8, sold: '1.2万', tag: '自营' },
  { id: 2, name: '机械键盘 87 键', sub: 'Gasket 结构 · 三模连接', group: '数码', price: 329, old: 429, rate: 4.7, sold: '8600', tag: '新品' },
  { id: 3, name: '智能手表 S2', sub: '血氧心率 · 双频 GPS', group: '数码', price: 899, old: 1099, rate: 4.6, sold: '5400', tag: '自营' },
  { id: 4, name: '便携充电宝 20K', sub: '22.5W 快充 · 可上飞机', group: '数码', price: 129, old: 169, rate: 4.9, sold: '3.1万' },
  { id: 5, name: '纯棉圆领 T 恤', sub: '220g 重磅 · 三色可选', group: '服饰', price: 79, old: 129, rate: 4.5, sold: '2.3万', tag: '爆款' },
  { id: 6, name: '轻量冲锋衣', sub: '三防面料 · 可收纳', group: '服饰', price: 359, old: 599, rate: 4.7, sold: '6200' },
  { id: 7, name: '亚麻通勤衬衫', sub: '免烫抗皱 · 合身版型', group: '服饰', price: 199, old: 259, rate: 4.4, sold: '3800' },
  { id: 8, name: '香薰加湿器', sub: '静音大雾量 · 精油可用', group: '家居', price: 149, old: 199, rate: 4.6, sold: '1.8万', tag: '自营' },
  { id: 9, name: '全棉四件套', sub: 'A 类母婴级 · 1.8m 床', group: '家居', price: 429, old: 599, rate: 4.8, sold: '4200' },
  { id: 10, name: '陶瓷马克杯', sub: '简约哑光 · 420ml', group: '家居', price: 39, old: 59, rate: 4.5, sold: '5.6万' },
  { id: 11, name: '精华水乳套装', sub: '烟酰胺提亮 · 混油适用', group: '美妆', price: 289, old: 399, rate: 4.7, sold: '9800', tag: '爆款' },
  { id: 12, name: '哑光口红 03', sub: '丝绒雾面 · 持久不沾杯', group: '美妆', price: 159, old: 210, rate: 4.6, sold: '1.4万' },
];

interface Flash { id: number; name: string; price: number; old: number; pct: number }
const FLASH: Flash[] = [
  { id: 101, name: '蓝牙耳机 Air', price: 99, old: 199, pct: 86 },
  { id: 102, name: '电动牙刷 X3', price: 129, old: 249, pct: 62 },
  { id: 103, name: '落地风扇 Pro', price: 199, old: 349, pct: 45 },
  { id: 104, name: '便携榨汁杯', price: 69, old: 139, pct: 78 },
];

const BANNERS = [
  { seed: 'mall-b1', caption: '秋季焕新 · 全场每满 300 减 50' },
  { seed: 'mall-b2', caption: '数码狂欢周 · 爆款 12 期免息' },
  { seed: 'mall-b3', caption: '会员日 · 大额券限量开抢' },
];
const bannerUri = (s: string): string => `https://picsum.photos/seed/${s}/1200/340`;
const goodsUri = (id: number): string => `https://picsum.photos/seed/mall-g${id}/400/300`;

const money = (v: number): string => (Number.isInteger(v) ? `¥${v}` : `¥${v.toFixed(2)}`);

/* ────────────────────────── 小组件 ────────────────────────── */

/** 区块头：左标题右附注，全页统一节奏 */
function SectionHead(props: { title: string; extra?: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <View style={{ width: 4, height: token.fontSize, borderRadius: 2, backgroundColor: token.colorPrimary }} />
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>{props.title}</Text>
      </View>
      {props.extra ?? null}
    </View>
  );
}

/* ────────────────────────── 主组件 ────────────────────────── */

interface CartLine { goods: Goods; qty: number }

export function MallDemo(): React.ReactElement {
  const { token } = useToken();
  const [query, setQuery] = React.useState('');
  const [group, setGroup] = React.useState<'全部' | Group>('全部');
  const [cart, setCart] = React.useState<Record<number, CartLine>>({});
  const [cartOpen, setCartOpen] = React.useState(false);
  const [msg, setMsg] = React.useState<{ type: MessageType; content: string } | null>(null);

  const toast = (type: MessageType, content: string): void => setMsg({ type, content });
  const addCart = (g: Goods): void => {
    setCart((c) => ({ ...c, [g.id]: { goods: g, qty: (c[g.id]?.qty ?? 0) + 1 } }));
    toast('success', `已加入购物车：${g.name}`);
  };
  const setQty = (id: number, qty: number | null): void => {
    setCart((c) => {
      const line = c[id];
      if (!line) return c;
      if (!qty || qty <= 0) {
        const { [id]: _drop, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: { ...line, qty } };
    });
  };

  const lines = Object.values(cart).sort((a, b) => a.goods.id - b.goods.id);
  const cartCount = lines.reduce((s, l) => s + l.qty, 0);
  const cartTotal = lines.reduce((s, l) => s + l.goods.price * l.qty, 0);

  const shown = GOODS.filter(
    (g) => (group === '全部' || g.group === group) && (!query || g.name.includes(query) || g.sub.includes(query)),
  );
  const rows: Goods[][] = [];
  for (let i = 0; i < shown.length; i += 4) rows.push(shown.slice(i, i + 4));

  return (
    <View style={{ gap: token.marginLG, position: 'relative' }}>
      {/* ── 搜索栏 + 购物车入口 ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Search
            placeholder="搜索商品，如：耳机 / 冲锋衣"
            enterButton="搜索"
            onSearch={(v) => { setQuery(v.trim()); setGroup('全部'); }}
          />
        </View>
        {query ? (
          <Tag closable onClose={() => setQuery('')} icon="search">{query}</Tag>
        ) : null}
        <Pressable onPress={() => setCartOpen((v) => !v)} style={{ flexShrink: 0 }}>
          <Button type={cartOpen ? 'primary' : 'default'} icon={<Icon name="shoppingCart" size={token.fontSize} />}>
            <Badge count={cartCount} offset={[6, -2]}>购物车</Badge>
          </Button>
        </Pressable>
      </View>

      {/* ── 购物车面板（展开式）──
          本栈 Drawer/Message 无 portal，absolute 锚到滚动内容而非视口（整页案例里 footer 会落到屏外），
          故购物车用内联面板替代抽屉；Message 铺在页首相对定位根内，属同样语义的取舍 */}
      {cartOpen ? (
        <Card
          title={`购物车（${cartCount} 件）`}
          extra={(<Button type="link" size="small" onPress={() => setCartOpen(false)}>收起</Button>)}
          bodyStyle={{ padding: token.padding, gap: token.marginSM }}
        >
          {lines.length === 0 ? (
            <Empty description="购物车空空如也" imageSize={88} />
          ) : (
            lines.map((l) => (
              <View key={l.goods.id} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, padding: token.paddingSM, borderRadius: token.borderRadiusLG, backgroundColor: token.colorFillQuaternary }}>
                <ImageBox src={goodsUri(l.goods.id)} width={52} height={52} />
                <View style={{ flex: 1, minWidth: 0, gap: token.marginXXS }}>
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{l.goods.name}</Text>
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{money(l.goods.price)} × {l.qty}</Text>
                </View>
                <InputNumber size="small" min={1} max={99} value={l.qty} onChange={(v) => setQty(l.goods.id, v)} style={{ width: 72 }} />
                <Pressable onPress={() => setQty(l.goods.id, 0)} style={{ padding: token.paddingXXS }}>
                  <Icon name="delete" size={token.fontSize} color={token.colorTextTertiary} />
                </Pressable>
              </View>
            ))
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
            <Button size="small" onPress={() => { setCart({}); toast('info', '已清空购物车'); }}>清空</Button>
            <View style={{ flex: 1 }} />
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>合计</Text>
            <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorError }}>{money(cartTotal)}</Text>
            <Button
              type="primary"
              onPress={() => {
                if (!lines.length) { toast('warning', '购物车还是空的'); return; }
                setCart({}); setCartOpen(false); toast('success', `下单成功，共 ${cartCount} 件 · ${money(cartTotal)}`);
              }}
            >
              去结算
            </Button>
          </View>
        </Card>
      ) : null}

      {/* ── 促销轮播 ── */}
      <Carousel
        height={170}
        autoPlay={4000}
        arrows
        dots
        preload={BANNERS.map((b) => bannerUri(b.seed))}
        slides={BANNERS.map((b) => (
          // 自建定高容器压 caption：ImageBox 自带的 absolute 说明条在轮播包裹层里会逸到图外
          <View key={b.seed} style={{ position: 'relative', width: '100%', height: 170, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
            <ImageBox src={bannerUri(b.seed)} width="100%" height={170} radius={0} />
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: token.padding, paddingVertical: token.paddingXS, backgroundColor: fade('#000000', 0.55) }}>
              <Text style={{ fontSize: token.fontSize, color: '#ffffff' }}>{b.caption}</Text>
            </View>
          </View>
        ))}
      />

      {/* ── 热门分类宫格 ── */}
      <View style={{ gap: token.marginSM }}>
        <SectionHead title="热门分类" extra={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>共 {CATS.length} 个分类</Text>} />
        <Card bodyStyle={{ padding: token.paddingLG }}>
          <View style={{ gap: token.marginLG }}>
            {[0, 5].map((start) => (
              <View key={start} style={{ flexDirection: 'row' }}>
                {CATS.slice(start, start + 5).map((c) => (
                  <Pressable key={c.label} onPress={() => toast('info', `分类「${c.label}」仅为演示`)} style={{ flex: 1, alignItems: 'center', gap: token.marginXS }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: fade(c.color, 0.14) }}>
                      <Icon name={c.icon} size={22} color={c.color} />
                    </View>
                    <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{c.label}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* ── 限时秒杀 ── */}
      <View style={{ gap: token.marginSM }}>
        <SectionHead
          title="限时秒杀"
          extra={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>距结束</Text>
              <CountDown leftTime={2 * 3600_000 + 18 * 60_000} format="HH:mm:ss" valueStyle={{ color: token.colorError, fontSize: token.fontSizeSM }} />
            </View>
          )}
        />
        {/* 行直接子项 + stretch：四张秒杀卡等高对齐 */}
        <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.marginSM }}>
          {FLASH.map((f) => (
            <Card
              key={f.id}
              style={{ flex: 1, minWidth: 0 }}
              cover={<ImageBox src={`https://picsum.photos/seed/mall-f${f.id}/400/300`} width="100%" height={120} radius={0} />}
              bodyStyle={{ padding: token.padding }}
            >
              <View style={{ gap: token.marginXS }}>
                <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{f.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: token.marginXS }}>
                  <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorError }}>{money(f.price)}</Text>
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextQuaternary, textDecorationLine: 'line-through' }}>{money(f.old)}</Text>
                </View>
                <Progress percent={f.pct} size="small" showInfo={false} strokeColor={token.colorError} format={() => ''} />
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>已抢 {f.pct}%</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* ── 精选商品 ── */}
      <View style={{ gap: token.marginSM }}>
        <SectionHead
          title="精选好物"
          extra={(
            <Segmented
              size="small"
              options={['全部', '数码', '服饰', '家居', '美妆']}
              value={group}
              onChange={(v) => setGroup(v as '全部' | Group)}
            />
          )}
        />
        {shown.length === 0 ? (
          <Card bodyStyle={{ padding: token.paddingLG }}>
            <Empty description={`没有匹配「${query || group}」的商品`} />
          </Card>
        ) : (
          rows.map((row, ri) => (
            // 行直接子项 + stretch：同排商品卡等高；卡内结构固定（名/副题/评分/价/按钮）
            <View key={ri} style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.marginSM }}>
              {row.map((g) => (
                <Card
                  key={g.id}
                  hoverable
                  style={{ flex: 1, minWidth: 0 }}
                  cover={<ImageBox src={goodsUri(g.id)} width="100%" height={160} radius={0} />}
                  bodyStyle={{ padding: token.padding }}
                >
                  <View style={{ gap: token.marginXS }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
                      {g.tag ? <Tag color="red" bordered={false} style={{ marginRight: 0 }}>{g.tag}</Tag> : null}
                      <Text style={{ fontSize: token.fontSize, color: token.colorText, fontWeight: '500', flexShrink: 1 }}>{g.name}</Text>
                    </View>
                    <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{g.sub}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
                      <Rate readOnly allowHalf value={g.rate} size={12} gap={2} />
                      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{g.sold} 人已购</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: token.marginXS }}>
                      <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorError }}>{money(g.price)}</Text>
                      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextQuaternary, textDecorationLine: 'line-through' }}>{money(g.old)}</Text>
                    </View>
                    <Button type="primary" size="small" block icon={<Icon name="shoppingCart" size={token.fontSizeSM} />} onPress={() => addCart(g)}>
                      加入购物车
                    </Button>
                  </View>
                </Card>
              ))}
              {/* 末行补空位保持卡宽一致 */}
              {row.length < 4 ? Array.from({ length: 4 - row.length }, (_, k) => <View key={`ph${k}`} style={{ flex: 1 }} />) : null}
            </View>
          ))
        )}
      </View>

      {/* ── 全局轻提示（锚页首，见上注释）── */}
      {msg ? (
        <Message open type={msg.type} content={msg.content} duration={2200} onClose={() => setMsg(null)} />
      ) : null}
    </View>
  );
}

export default MallDemo;
