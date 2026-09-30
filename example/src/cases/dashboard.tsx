// DASHBOARD：用现有组件拼一张「数据分析看板」案例页——不新增任何原子件，纯组合。
// 用到的组件：Card / Segmented / Switch / Button / Tag / StatisticGroup(StatCard) /
//   AreaChart / ColumnChart / PieChart / RadialBarChart / ProTable / Timeline / CalendarHeatmapChart /
//   ChartExportButton（区域快照导出 PNG）。
// 交互：时间范围切换（换 key 重播入场动画）、自动刷新开关（每 2.5s 微采样的 KPI/走势，count-up 补间）、手动刷新（换种子重排 mock）。
import React from 'react';
import {
  View, Text, Card, Tag, Button, Switch, Segmented, useToken,
  StatisticGroup, type StatCardProps,
  AreaChart, ColumnChart, PieChart, RadialBarChart, CalendarHeatmapChart,
  ProTable, type ProColumn,
  Timeline, ChartExportButton,
} from 'react-native-flux-desktop';

/** 确定性伪随机（同种子重排一致，换种子全量重排） */
function makeRng(seed: number): () => number {
  let s = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (): number => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

type RangeKey = '1d' | '7d' | '30d';
const RANGE_LABEL: Record<RangeKey, string> = { '1d': '今日', '7d': '近 7 日', '30d': '近 30 日' };
const RANGE_FACTOR: Record<RangeKey, number> = { '1d': 1, '7d': 6.4, '30d': 27 };
const X_LABELS: Record<RangeKey, string[]> = {
  '1d': ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
  '7d': ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  '30d': ['1日', '5日', '9日', '13日', '17日', '21日', '25日', '29日'],
};

const CHANNELS = ['搜索引擎', '直接访问', '社交媒体', '邮件营销', '联盟广告'];
const REGIONS = ['华东', '华南', '华北'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const PRODUCT_NAMES = ['蓝牙耳机 Pro', '机械键盘 K87', '无线鼠标 M3', '4K 显示器 27', '高清摄像头 C2', '移动电源 20K', '降噪耳麦 H1', '智能手表 S2', '便携投影仪'];

interface Product {
  id: number;
  rank: number;
  name: string;
  channel: string;
  sales: number;
  rate: number;
}

/** 日历热力图：近 9 个月提交/发布活跃度（周末稀疏 + 随机空档） */
function genContrib(seed: number): Record<string, any>[] {
  const rnd = makeRng(seed);
  const out: Record<string, any>[] = [];
  const start = Date.UTC(2026, 0, 1);
  for (let i = 0; i < 270; i++) {
    const ms = start + i * 86400000;
    const wd = new Date(ms).getUTCDay();
    const r = rnd();
    let v = 0;
    if (wd === 0 || wd === 6) { if (r > 0.45) v = Math.floor(rnd() * 6); }
    else if (r > 0.12) v = 1 + Math.floor(rnd() * 12);
    if (rnd() > 0.9) v = 0;
    const d = new Date(ms);
    out.push({ date: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`, value: v });
  }
  return out;
}

function DashboardBody(props: { range: RangeKey; seed: number; tick: number; loading: boolean }): React.ReactElement {
  const { range, seed, tick, loading } = props;
  const { token } = useToken();
  const coreRef = React.useRef<any>(null);
  const f = RANGE_FACTOR[range];
  const rnd = makeRng(seed + (range === '1d' ? 1 : range === '7d' ? 2 : 3));

  // ---- KPI 指标卡 ----
  const visits = Math.round(48219 * f * (0.85 + rnd() * 0.3));
  const conv = 3.1 + rnd() * 1.2;
  const gmv = Math.round(1284560 * f * (0.8 + rnd() * 0.4));
  const shops = Math.round(1863 * (0.9 + rnd() * 0.2));
  const spark = (n: number, up: boolean): number[] =>
    Array.from({ length: 7 }, (_, i) => Math.round(n * (0.6 + i * (up ? 0.06 : -0.05) + rnd() * 0.2)));
  const kpis: StatCardProps[] = [
    { title: `${RANGE_LABEL[range]}访问量`, value: visits + (range === '1d' ? tick * 37 : 0), trend: { direction: 'up', value: '12.4%' }, spark: spark(visits / 8, true) },
    { title: '支付转化率', value: conv + (range === '1d' ? tick * 0.01 : 0), precision: 2, suffix: '%', trend: { direction: 'down', value: '0.6%' }, spark: spark(conv * 20, false) },
    { title: `${RANGE_LABEL[range]} GMV`, value: gmv + (range === '1d' ? tick * 1200 : 0), prefix: '¥ ', trend: { direction: 'up', value: '8.3%' }, spark: spark(gmv / 8, true) },
    { title: '活跃商家', value: shops, tag: '实时', trend: { direction: 'up', value: '2.1%' }, spark: spark(shops / 6, true) },
  ];

  // ---- 流量与转化走势（面积双序列）----
  const trend: Record<string, any>[] = [];
  const xs = X_LABELS[range];
  const baseV = 4200 * f / (range === '1d' ? 5 : 6);
  xs.forEach((x, i) => {
    const jitter = 1 + (i % 3) * 0.18 + rnd() * 0.3;
    trend.push({ x, value: Math.round(baseV * jitter) + (range === '1d' && i >= xs.length - 2 ? tick * 60 : 0), type: '访问量' });
    trend.push({ x, value: Math.round(baseV * 0.24 * jitter) + (range === '1d' && i >= xs.length - 2 ? tick * 9 : 0), type: '转化量' });
  });

  // ---- 渠道销售额（堆叠柱）----
  const sales: Record<string, any>[] = [];
  for (const q of QUARTERS) for (const r of REGIONS) sales.push({ quarter: q, region: r, value: Math.round((140 + rnd() * 260) * f / 6) });

  // ---- 流量构成（环形饼）----
  const source: Record<string, any>[] = CHANNELS.map((type) => ({ type, value: Math.round(300 + rnd() * 900) }));

  // ---- 资源占用（径向条）----
  const radial: Record<string, any>[] = [
    { name: '服务器', value: Math.round(55 + rnd() * 40) },
    { name: '磁盘', value: Math.round(40 + rnd() * 45) },
    { name: '带宽', value: Math.round(30 + rnd() * 50) },
    { name: 'CPU', value: Math.round(50 + rnd() * 45) },
  ];

  // ---- 热销商品榜 ----
  const products: Product[] = PRODUCT_NAMES.map((name, i) => ({
    id: i + 1,
    rank: i + 1,
    name,
    channel: CHANNELS[(i * 2 + seed) % CHANNELS.length],
    sales: Math.round((9800 - i * 870) * (0.7 + rnd() * 0.6)),
    rate: 1.5 + rnd() * 4.5,
  })).sort((a, b) => b.sales - a.sales).map((p, i) => ({ ...p, rank: i + 1 }));

  const columns: ProColumn<Product>[] = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 70, render: (v: number) => <Text style={{ fontWeight: v <= 3 ? '600' : '400', color: v <= 3 ? token.colorPrimary : token.colorText }}>{v}</Text> },
    { title: '商品', dataIndex: 'name', key: 'name', width: 190, search: true },
    { title: '渠道', dataIndex: 'channel', key: 'channel', width: 120 },
    { title: '销量', dataIndex: 'sales', key: 'sales', width: 110, sorter: (a, b) => a.sales - b.sales, render: (v: number) => <Text>{v.toLocaleString()}</Text> },
    { title: '转化率', dataIndex: 'rate', key: 'rate', width: 100, sorter: (a, b) => a.rate - b.rate, render: (v: number) => <Text>{v.toFixed(2)}%</Text> },
  ];

  // ---- 最新动态（时间线）----
  const events: { color: string; label: string; text: string }[] = [
    { color: 'green', label: '09:20', text: 'GMV 突破阶段目标，达成率 102%' },
    { color: 'blue', label: '10:05', text: '「搜索引擎」渠道流量激增 32%' },
    { color: 'red', label: '11:40', text: '「机械键盘 K87」库存告警，余量 12%' },
    { color: 'blue', label: '13:18', text: '新商品「智能手表 S2」上架并通过审核' },
    { color: 'green', label: '16:42', text: '渠道返利到账 ¥ 86,400' },
  ];

  const contrib = genContrib(seed * 7 + 20260101);

  const gap = { gap: token.margin };
  return (
    <View style={{ gap: token.marginLG }}>
      {/* 工具条（不用 flexWrap：本 Yoga 下 wrap+flex:1 占位会错位丢画） */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexShrink: 0 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: token.colorPrimary }} />
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>数据分析看板</Text>
          <Tag color="processing">组合示例</Tag>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: token.fontSizeSM, color: loading ? token.colorTextTertiary : token.colorTextSecondary }}>
          {loading ? '数据加载中…' : `最近更新 ${new Date().toTimeString().slice(0, 8)}`}
        </Text>
        {/* FileSaver 根节点 width:100%，入 row 需显式改 auto，否则把兄弟挤零宽 */}
        <ChartExportButton target={coreRef} filename="dashboard-core.png" title="导出概览快照" style={{ width: 'auto', flexShrink: 0 }} />
      </View>

      {/* 核心区（KPI + 两张主图）：整块可导出的“概览” */}
      <View ref={coreRef} style={gap}>
        {/* KPI 不做 loading 翻转：Statistic loading↔真值切换时数值行高不重排（趋势行会叠上大数字），骨架只给固定高的图表 Card */}
        <StatisticGroup items={kpis} />
        <View style={{ flexDirection: 'row', gap: token.margin }}>
          <Card title="流量与转化走势" loading={loading} extra={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{RANGE_LABEL[range]}</Text>} style={{ flex: 3 }}>
            <AreaChart data={trend} xField="x" yField="value" seriesField="type" smooth gradient height={240} />
          </Card>
          <Card title="流量构成" loading={loading} style={{ flex: 2 }}>
            <PieChart data={source} angleField="value" colorField="type" size={160} innerRadius={0.55} centerTitle="总访问" />
          </Card>
        </View>
      </View>

      {/* 第二区：堆叠柱 + 资源环 */}
      <View style={{ flexDirection: 'row', gap: token.margin }}>
        <Card title="渠道销售额分布" loading={loading} extra={<Tag>堆叠</Tag>} style={{ flex: 3 }}>
          <ColumnChart data={sales} xField="quarter" yField="value" seriesField="region" stack maxColumnWidth={48} height={230} />
        </Card>
        <Card title="资源占用率" loading={loading} style={{ flex: 2 }}>
          <RadialBarChart data={radial} nameField="name" valueField="value" max={100} centerTitle="资源" size={170} />
        </Card>
      </View>

      {/* 第三区：热销榜 + 动态时间线 */}
      <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
        <Card title="热销商品榜" size="small" style={{ flex: 3 }}>
          <ProTable<Product>
            columns={columns}
            dataSource={products}
            rowKey={(r) => r.id}
            pageSize={5}
            striped
            filterFields={[{ name: 'channel', label: '渠道', type: 'select', options: CHANNELS.map((c) => ({ label: c, value: c })), width: 120 }]}
          />
        </Card>
        <Card title="最新动态" size="small" style={{ flex: 2 }}>
          <Timeline
            pending="等待更多动态…"
            items={events.map((e) => ({
              key: e.label,
              color: e.color,
              label: e.label,
              children: <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{e.text}</Text>,
            }))}
          />
        </Card>
      </View>

      {/* 尾部：发布活跃度日历热力图 */}
      <Card title="发布活跃度" extra={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>近 9 个月</Text>}>
        <CalendarHeatmapChart data={contrib} color="#2EA043" cellSize={11} cellGap={3} startOfWeek={1} levels={5} weekdayNames={['日', '一', '二', '三', '四', '五', '六']} />
      </Card>
    </View>
  );
}

export function DashboardDemo(): React.ReactElement {
  const [range, setRange] = React.useState<RangeKey>('1d');
  const [seed, setSeed] = React.useState(7);
  const [auto, setAuto] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { token } = useToken();

  // 切范围/换种子：模拟 450ms 请求，期间 KPI 与主图卡显骨架
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [range, seed]);

  React.useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setTick((x) => x + 1), 2500);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <View style={{ gap: token.margin }}>
      {/* 控制条放在最外圈：切范围/刷新在这里 setState，避免 DashboardBody 反向依赖 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          本页零新增组件：Card / Segmented / Switch / Tag / StatisticGroup / Area / Column / Pie / RadialBar / ProTable / Timeline / CalendarHeatmap / ChartExportButton 组合而成
        </Text>
        <View style={{ flexShrink: 0 }}>
          <Segmented
            value={range}
            onChange={(v) => { setRange(v as RangeKey); setTick(0); }}
            options={[
              { label: '今日', value: '1d' },
              { label: '近 7 日', value: '7d' },
              { label: '近 30 日', value: '30d' },
            ]}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexShrink: 0 }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>自动刷新</Text>
          <Switch checked={auto} onChange={setAuto} size="small" />
        </View>
        <View style={{ flexShrink: 0 }}>
          <Button size="small" onClick={() => { setSeed((s) => s + 1); setTick(0); }}>刷新数据</Button>
        </View>
      </View>
      <DashboardBody key={`${range}-${seed}`} range={range} seed={seed} tick={tick} loading={loading} />
    </View>
  );
}

export default DashboardDemo;
