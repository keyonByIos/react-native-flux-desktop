// 案例段：不用左侧菜单，主区就是一块大白板，摆三个案例卡片按钮。
// 点任意一张 → openThemedWindow（见 components/AppWindow）弹一扇独立窗口承载该案例整页 demo：
//   · 新窗配置与主窗口一致（默认 1280×640、min 同尺寸、带标题栏）；
//   · 标题沿用现有 menu 名称；
//   · 主题壳 / 背景 / 滚动 / tag 去重全部收敛到 AppWindow，案例段只声明「开哪扇、装什么」。
import React from 'react';
import { View, Text, Icon, Pressable, useToken } from 'react-native-flux-desktop';
import { openThemedWindow } from './AppWindow';
import { DashboardDemo } from '../cases/dashboard';
import { CryptoLiveDemo } from '../cases/crypto-live';
import { MallDemo } from '../cases/mall';
import { WalletDemo } from '../cases/wallet';
import { HeavyChartsDemo } from '../cases/heavy-charts';

interface CaseDef {
  key: string;
  /** 沿用现有 menu 名称，作为窗口标题 */
  title: string;
  icon: string;
  desc: string;
  node: React.ReactNode;
  /** 外层是否包 ScrollView（内容自带滚动时置 false，避免嵌套滚动致 flex 塌陷空白） */
  scroll?: boolean;
}

const CASES: CaseDef[] = [
  {
    key: 'dashboard',
    title: '数据分析看板 Dashboard',
    icon: 'dashboard',
    desc: 'StatisticGroup + 面积/柱状/饼/水波/日历热力图 + ProTable + Timeline 的整页分析看板',
    node: <DashboardDemo />,
  },
  {
    key: 'crypto-live',
    title: '区块链币价实时看板 Crypto Live',
    icon: 'activity',
    desc: '币安官方 API 直连：实时 K 线（MA/MACD/VOL）+ 深度 + 盘口梯 + 逐笔成交 + 24h 行情榜',
    node: <CryptoLiveDemo />,
  },
  {
    key: 'mall',
    title: '商城首页 Mall Shop',
    icon: 'shoppingCart',
    desc: '搜索 + 可展开购物车 + 促销轮播 + 分类宫格 + 限时秒杀 + 商品网格的整页电商组合',
    node: <MallDemo />,
  },
  {
    key: 'wallet',
    title: 'EVM 钱包 Wallet',
    icon: 'wallet',
    desc: '参照 TokenPocket 功能逻辑的桌面多链钱包：多链/多钱包 + 资产（测试节点真实余额）+ 行情 + DApp + 记录 + 转账/收款/创建/导入（全走测试环境 · 演示态）',
    node: <WalletDemo />,
  },
  {
    key: 'heavy-charts',
    title: '实时运营监控大屏 Ops Live',
    icon: 'activity',
    desc: '图表密集的常规业务看板：顶栏常驻实时帧率（FpsMonitor），十余种图表（滚动面积/折线、成功率仪表、堆叠柱、组合、漏斗、雷达、玫瑰、气泡、瀑布、热力、矩形树、日历热力）+ 实时订单流水与风控告警，可选 1s/2.5s/5s 定时刷新。',
    node: <HeavyChartsDemo />,
  },
];

/** 开一扇案例窗：尺寸/主题/背景/滚动/去重全交给 openThemedWindow（默认与主窗同尺寸） */
function openCase(c: CaseDef): void {
  openThemedWindow({ tag: `case-${c.key}`, title: c.title, node: c.node, scroll: c.scroll });
}

function CaseCard(props: { c: CaseDef }): React.ReactElement {
  const { token } = useToken();
  const { c } = props;
  return (
    <Pressable
      onPress={() => openCase(c)}
      style={{
        width: 300,
        padding: token.paddingLG,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorBgContainer,
        cursor: 'pointer',
        gap: token.marginSM,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: token.borderRadius,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: token.colorPrimaryBg,
          }}
        >
          <Icon name={c.icon} size={22}/>
        </View>
        <Text style={{ flex: 1, fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>{c.title}</Text>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSizeSM * 1.4 }}>
        {c.desc}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS, marginTop: 2 }}>
        <Icon name="appstore" size={14} color={token.colorPrimary} />
        <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorPrimary }}>在新窗口打开</Text>
      </View>
    </Pressable>
  );
}

/** 案例段主区：无左菜单，一块大白板 + 三个案例按钮 */
export function CaseBoard(): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: token.colorBgContainer,
        alignItems: 'center',
        justifyContent: 'center',
        padding: token.padding,
      }}
    >
      <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>案例 Cases</Text>
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: token.marginXS, marginBottom: token.marginXL }}>
        点击任意案例，在独立窗口中打开 · 窗口配置与主窗口一致
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: token.marginLG }}>
        {CASES.map((c) => (
          <CaseCard key={c.key} c={c} />
        ))}
      </View>
    </View>
  );
}
