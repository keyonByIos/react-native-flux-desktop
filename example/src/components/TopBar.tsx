// TopBar：Gallery 主窗顶部导航栏（从 App.tsx 抽离，单独封装）。
// 左：段切换 Segmented；右：暗亮切换 · FpsMonitor · MemMonitor · 头像下拉（主题设置 / 注销）。
// 纯展示 + 回调，不持有业务状态：段切换/注销的 state 仍由 Shell 掌管，经 props 传入。
import React from 'react';
import {
  View,
  Text,
  Icon,
  Segmented,
  Avatar,
  Pressable,
  Dropdown,
  MemMonitor,
  FpsMonitor,
  useToken,
} from 'react-native-flux-desktop';
import type { Section } from '../data/nav';
import { openThemeSettings } from './ThemeSettings';
import { openPerfDetails } from '../window/PerfDetails';

/** 段切换选项（顺序即导航顺序）；与 Shell 的 nav 派生保持一致。 */
const SECTION_OPTIONS: { label: string; value: Section }[] = [
  { label: '系统', value: 'sys' },
  { label: '组件', value: 'ui' },
  { label: 'Web3', value: 'web3' },
  { label: '开发', value: 'dev' },
  { label: '图表', value: 'chart' },
  { label: '案例', value: 'case' },
];

export interface TopBarProps {
  /** 当前段 */
  section: Section;
  /** 切换段 */
  onSwitchSection: (s: Section) => void;
  /** 是否暗色 */
  dark: boolean;
  /** 切换暗亮 */
  onToggleDark: (v: boolean) => void;
  /** 点击「注销」（由 Shell 打开确认 Modal） */
  onLogout: () => void;
}

export function TopBar(props: TopBarProps): React.ReactElement {
  const { token } = useToken();
  const { section, onSwitchSection, dark, onToggleDark, onLogout } = props;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.margin,
        paddingHorizontal: token.paddingLG,
        paddingVertical: token.paddingSM,
        borderBottomWidth: token.lineWidth,
        borderBottomColor: token.colorBorderSecondary,
        backgroundColor: token.colorBgContainer,
      }}
    >
      {/* alignSelf:'center' 覆盖 Segmented 内部默认的 flex-start（非 block 时），使其在居中行里与 FpsMonitor 等高线对齐 */}
      <Segmented value={section} onChange={(v) => onSwitchSection(v as Section)} options={SECTION_OPTIONS} style={{ alignSelf: 'center' }} />
      <FpsMonitor intervalMs={500} maxPoints={24} showChart={false}/>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: token.margin }}>
        <Pressable
          onPress={() => onToggleDark(!dark)}
          style={{
            width: 32,
            height: 32,
            borderRadius: token.borderRadius,
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name={dark ? 'sun' : 'moon'} size={18} color={token.colorText} />
        </Pressable>
        <MemMonitor dropdown defaultOpen={false} />
        <Dropdown
          placement="bottomRight"
          arrow
          menu={{
            items: [
              { key: 'theme-settings', label: '主题设置', icon: 'setting' },
              { key: 'perf-details', label: '性能详情', icon: 'dashboard' },
              { key: 'divider-1', type: 'divider' },
              { key: 'logout', label: '注销', icon: 'logOut', danger: true },
            ],
            onClick: (key) => {
              if (key === 'theme-settings') openThemeSettings();
              else if (key === 'perf-details') openPerfDetails();
              else if (key === 'logout') onLogout();
            },
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
            <Avatar size={28} src="https://picsum.photos/seed/keyon/32" alt="keyon" />
            <Text style={{ fontSize: token.fontSize, color: token.colorText }}>keyon</Text>
            <Icon name="down" size={12} color={token.colorTextSecondary} />
          </View>
        </Dropdown>
      </View>
    </View>
  );
}
