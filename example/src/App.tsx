// Gallery 入口：左侧 Menu 导航 + 右侧内容区 + 顶部段切换 + 主题控制。
// 导航数据见 data/nav.ts，条目注册表见 data/entries.tsx，主题设置窗见 components/ThemeSettings.tsx。
import './bootstrap-env'; // 必须第一行：React require 前决定 dev/prod 构建（打包态走 prod，省内存+CPU）
import React from 'react';
import fs from 'fs';
import path from 'path';
import {
  render,
  grabAll,
  Window,
  View,
  Text,
  ScrollView,
  Menu,
  Modal,
  Checkbox,
  message,
  FluxProvider,
  useToken,
  FadeIn,
  Anchor,
  ContextMenuLayer,
  TextSelectionLayer,
  DragLayer,
  App,
  Application,
  acquireSingleInstance,
  configureLogger,
  type LogLevel,
  type AnchorLink,
} from 'react-native-flux-desktop';
import { ThemeAlgorithm } from 'react-native-flux-desktop';
import { DemoNavContext, type DemoSection } from './DemoPage';
import {
  type Section,
  firstOf,
  NAV_SYSTEM,
  NAV_UI,
  NAV_WEB3,
  NAV_CASE,
  NAV_DEV,
  NAV_CHART,
} from './data/nav';
import { buildEntries, type ThemeCtl } from './data/entries';
import { seedThemeFromEnv, useAppTheme } from './components/ThemeSettings';
import { openTrayMenu, trayBus } from './components/TrayMenu';
import { CaseBoard } from './components/CaseBoard';
import { openThemedWindow } from './components/AppWindow';
import { TopBar } from './components/TopBar';
import { HeavyChartsDemo } from './cases/heavy-charts';
import { openPerfDetails } from './window/PerfDetails';

// 项目配置（根目录 app.json）
interface AppConfig {
  name: string;
  description: string;
  version: string;
  icon: string;
  allowMultiOpen?: boolean;
  logger?: { path?: string; level?: LogLevel };
}
const APP: AppConfig = (() => {
  const fallback: AppConfig = { name: 'App', description: '', version: '0.0.0', icon: 'assets/icon.png' };
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'app.json'), 'utf8');
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
})();

if (APP.icon) process.env.FLUX_ICON = path.isAbsolute(APP.icon) ? APP.icon : path.join(process.cwd(), APP.icon);
process.env.FLUX_APP_ID = `FluxDesktop.${APP.name.replace(/[^0-9A-Za-z]+/g, '')}`;

/** 章节列表是否等价（id/标题/Y 全一致）：避免 onLayout 回传时形成重渲染循环 */
function sameSections(a: DemoSection[], b: DemoSection[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].title !== b[i].title || Math.abs(a[i].y - b[i].y) > 0.5) return false;
  }
  return true;
}

/** 滚动联动：取最后一个已滚到顶部（y <= sy + 阈值）的章节为高亮项 */
function computeActiveHref(sections: DemoSection[], sy: number): string {
  let cur = sections.length ? sections[0].id : '';
  for (const s of sections) {
    if (s.y <= sy + 8) cur = s.id;
    else break;
  }
  return cur;
}

function Shell(props: ThemeCtl): React.ReactElement {
  const { token } = useToken();
  const { dark, compact, setDark, setCompact, animation, setAnimation, primary, setPrimary } = props;
  const [messageApi, messageContextHolder] = message.useMessage();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  // 托盘退出确认（应用内 token 驱动 Modal → 适应主题）+「下次不再询问」（勾中则写 App.prefs.confirmOnQuit=false）
  const [quitOpen, setQuitOpen] = React.useState(false);
  const [dontAsk, setDontAsk] = React.useState(false);
  const [section, setSection] = React.useState<Section>((process.env.FLUX_SECTION as Section) || 'sys');
  const [active, setActive] = React.useState<string>(process.env.FLUX_ACTIVE || firstOf((process.env.FLUX_SECTION as Section) || 'sys'));
  const entries = React.useMemo(() => buildEntries(props), []);
  const nav = section === 'sys' ? NAV_SYSTEM : section === 'ui' ? NAV_UI : section === 'web3' ? NAV_WEB3 : section === 'case' ? NAV_CASE : section === 'dev' ? NAV_DEV : NAV_CHART;
  const switchSection = (s: Section): void => {
    if (s === section) return;
    setSection(s);
    setActive(firstOf(s));
  };
  const entry = entries[active] ?? entries.theme ?? entries.button;

  // 系统托盘：主窗挂载时建托盘（不挂原生菜单），事件直接读写全局 Application.config（事件时取最新值）。
  //   左键单击 = 双击行为（唤主窗）；右键在图标处弹「自定义主题菜单」（TrayMenu.tsx）；
  //   菜单项意图经 trayBus 回到此处单点处理（退出确认 Modal 的状态在本组件，跨根只能走总线）。
  React.useEffect(() => {
    if (!Application.tray.available) return;
    Application.tray.create({ tooltip: APP.name, iconPath: process.env.FLUX_ICON });
    const wake = (): void => Application.wakeMainWindow();
    const offLeft = Application.tray.onLeftClick(wake);
    const offDbl = Application.tray.onDoubleClick(wake);
    const offRight = Application.tray.onRightClick((ev) => openTrayMenu(ev.rect));
    const onShow = wake;
    const onTheme = (): void => Application.config.setTheme({ dark: !Application.config.getTheme().dark });
    const onQuit = (): void => {
      // 勾过「不再询问」→ 直接退；否则唤起主窗弹应用内确认框（也适应主题）
      if (Application.config.getPrefs().confirmOnQuit) {
        Application.wakeMainWindow();
        setQuitOpen(true);
      } else {
        Application.log.write('gallery', '托盘直接退出（已勾不再询问）');
        process.exit(0);
      }
    };
    trayBus.on('show', onShow);
    trayBus.on('theme', onTheme);
    trayBus.on('quit', onQuit);
    return () => {
      offLeft();
      offDbl();
      offRight();
      trayBus.off('show', onShow);
      trayBus.off('theme', onTheme);
      trayBus.off('quit', onQuit);
      Application.tray.remove();
    };
  }, []);

  // 右侧锚点目录
  const [sy, setSy] = React.useState(Number(process.env.FLUX_SCROLL_Y) || 0);
  const [sections, setSections] = React.useState<DemoSection[]>([]);
  const activeRef = React.useRef(active);
  const genRef = React.useRef(0);
  if (activeRef.current !== active) {
    activeRef.current = active;
    genRef.current++;
    setSections([]);
    setSy(0);
  }
  const register = React.useCallback((s: DemoSection[]) => {
    const ns = [...s].sort((a, b) => a.y - b.y);
    const gen = genRef.current;
    setTimeout(() => {
      if (genRef.current !== gen) return;
      setSections((prev) => (sameSections(prev, ns) ? prev : ns));
    }, 0);
  }, []);
  const navValue = React.useMemo(() => ({ register }), [register]);
  const activeHref = computeActiveHref(sections, sy);
  const anchorItems: AnchorLink[] = sections.map((s) => ({ href: s.id, title: s.title }));

  return (
    <View style={{ flex: 1, position: 'relative', backgroundColor: token.colorBgContainer }}>
      {/* 顶部导航栏（已抽离为独立组件 components/TopBar） */}
      <TopBar
        section={section}
        onSwitchSection={switchSection}
        dark={dark}
        onToggleDark={setDark}
        onLogout={() => setLogoutOpen(true)}
      />

      {/* 案例段：大白板（无左菜单，点按钮弹独立窗口）；其余段：左侧菜单 + 右侧内容 */}
      {section === 'case' ? (
        <CaseBoard />
      ) : (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View
          style={{
            width: 236,
            backgroundColor: token.colorBgContainer,
            borderRightWidth: token.lineWidth,
            borderRightColor: token.colorBorderSecondary,
            paddingTop: token.paddingMD,
            paddingBottom: token.padding,
            paddingRight: token.paddingXS,
          }}
        >
          <ScrollView style={{ flex: 1 }}>
            <Menu
              accordion
              key={section}
              items={nav}
              selectedKeys={[active]}
              onClick={(i) => setActive(i.key)}
            />
          </ScrollView>
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: token.paddingLG,
              paddingVertical: token.padding,
              borderBottomWidth: token.lineWidth,
              borderBottomColor: token.colorBorderSecondary,
              backgroundColor: token.colorBgContainer,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText }}>
                {entry.title}
              </Text>
            </View>
          </View>
          <DemoNavContext.Provider value={navValue}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <ScrollView
                style={{ flex: 1 }}
                scrollY={sy}
                onScroll={(e) => setSy(e.nativeEvent.contentOffset.y)}
              >
                <FadeIn key={active} duration={280} style={{ padding: token.paddingLG }}>
                  {entry.node}
                </FadeIn>
              </ScrollView>
              {sections.length > 1 ? (
                <View
                  style={{
                    width: 168,
                    paddingTop: token.paddingLG + token.margin,
                    paddingRight: token.paddingLG,
                    paddingLeft: token.paddingSM,
                  }}
                >
                  <Anchor
                    showLine={false}
                    title="Usage"
                    items={anchorItems}
                    activeHref={activeHref}
                    onLinkClick={(href) => {
                      const s = sections.find((x) => x.id === href);
                      if (s) setSy(Math.max(0, s.y));
                    }}
                  />
                </View>
              ) : null}
            </View>
          </DemoNavContext.Provider>
        </View>
      </View>
      )}

      {messageContextHolder}
      <Modal
        open={logoutOpen}
        title="注销确认"
        okText="确定注销"
        cancelText="取消"
        okDanger
        onOk={() => {
          setLogoutOpen(false);
          messageApi.info('已注销');
        }}
        onCancel={() => setLogoutOpen(false)}
      >
        确定要注销当前登录吗？
      </Modal>

      {/* 托盘退出确认：勾「下次不再询问」→写 App.prefs.confirmOnQuit=false（持久 flux_app.kv），下次直接退 */}
      <Modal
        open={quitOpen}
        title="退出确认"
        okText="退出"
        cancelText="取消"
        okDanger
        onOk={() => {
          if (dontAsk) Application.config.setPrefs({ confirmOnQuit: false });
          setQuitOpen(false);
          Application.log.write('gallery', '托盘确认退出');
          process.exit(0);
        }}
        onCancel={() => setQuitOpen(false)}
      >
        <View style={{ gap: token.marginSM }}>
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>确定要退出 {APP.name} 吗？</Text>
          <Checkbox checked={dontAsk} onChange={setDontAsk} label="下次不再询问（直接退出）" />
        </View>
      </Modal>
    </View>
  );
}

function Gallery(): React.ReactElement {
  const { dark, compact, primary, animation, fontSize, controlHeight } = useAppTheme();
  const algorithm: ThemeAlgorithm[] = [
    dark ? 'dark' : 'default',
    ...(compact ? (['compact'] as ThemeAlgorithm[]) : []),
  ];
  // fontSize/controlHeight 仅在显式设值时注入（缺 key 才回落到算法默认）
  const token: Record<string, string | number> = { colorPrimary: primary, colorLink: primary, colorInfo: primary };
  if (fontSize != null) token.fontSize = fontSize;
  if (controlHeight != null) token.controlHeight = controlHeight;
  return (
    <Window title={APP.name} width={1280} height={Number(process.env.FLUX_WIN_H) || 640} minWidth={1280} minHeight={640}>
      <FluxProvider theme={{ algorithm, token }} animation={animation}>
        <App>
          <Shell
            dark={dark}
            compact={compact}
            setDark={(v) => Application.config.setTheme({ dark: v })}
            setCompact={(v) => Application.config.setTheme({ compact: v })}
            animation={animation}
            setAnimation={(v) => Application.config.setTheme({ animation: v })}
            primary={primary}
            setPrimary={(v) => Application.config.setTheme({ primary: v })}
          />
        </App>
        <ContextMenuLayer />
        <TextSelectionLayer />
        <DragLayer />
      </FluxProvider>
    </Window>
  );
}

// 启动
configureLogger({ path: APP.logger?.path, level: APP.logger?.level });
seedThemeFromEnv();

if (
  acquireSingleInstance({
    name: `flux-${APP.name.replace(/[^0-9A-Za-z]+/g, '')}`,
    allowMulti: APP.allowMultiOpen === true,
    onSecondInstance: () => Application.wakeMainWindow(),
  })
) {
  Application.log.write('gallery', 'Gallery 启动', { name: APP.name, version: APP.version });
  render(React.createElement(Gallery)).then(() => {
    // 诊断探针：FLUX_OPEN_CASE=1 时自动弹「实时运营监控大屏」独立窗（原「重图表压力测试」页，供无头抓 GPU 崩溃 stderr，免手动点卡片）
    //   FLUX_OPEN_CASE=text 则只开一扇纯文本第二窗（隔离“多窗口 GPU 必崩” vs “重图表内容才崩”）
    if (process.env.FLUX_OPEN_CASE === '1' || process.env.FLUX_OPEN_CASE === 'text') {
      const textNode = process.env.FLUX_OPEN_CASE === 'text';
      setTimeout(() => {
        Application.log.write('gallery', '[probe] FLUX_OPEN_CASE 自动开' + (textNode ? '纯文本' : '监控大屏') + '窗');
        openThemedWindow({
          tag: textNode ? 'probe-text' : 'case-heavy-charts',
          title: textNode ? 'Probe Text Window' : '实时运营监控大屏 (probe)',
          node: textNode
            ? React.createElement(View, { style: { padding: 24 } }, React.createElement(Text, { style: { fontSize: 20 } }, 'second window GPU present probe'))
            : React.createElement(HeavyChartsDemo),
          scroll: true,
        });
      }, 1200);
    }
    // 诊断探针：FLUX_OPEN_PERF=1 时自动弹「性能详情」独立窗（供无头抓帧复查版式，免点头像下拉）
    if (process.env.FLUX_OPEN_PERF === '1') {
      setTimeout(() => {
        Application.log.write('gallery', '[probe] FLUX_OPEN_PERF 自动开性能详情窗');
        openPerfDetails();
      }, 1200);
    }
    const dir = process.env.FLUX_GRAB_DIR;
    if (dir) {
      const delay = Number(process.env.FLUX_GRAB_DELAY) || 700;
      setTimeout(() => {
        grabAll(dir);
        process.exit(0);
      }, delay);
    }
  });
} else {
  console.log('[gallery] 已有实例在运行：已请求唤醒老窗口，本进程即将退出（单实例锁）');
}
