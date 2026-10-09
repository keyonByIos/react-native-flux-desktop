# react-native-flux-desktop（中文文档）

> 🖥️ 纯自绘的桌面渲染栈 —— 用 React（JSX）写桌面应用，每一个像素都由 Skia 直接绘制在自研底座的窗口上。不依赖 Electron / Qt / 任何系统原生控件。

![版本](https://img.shields.io/badge/version-0.1.0-blue) ![许可证](https://img.shields.io/badge/license-MIT-green) ![运行时](https://img.shields.io/badge/%E7%BA%AFReact%C2%B7%E5%8E%9F%E7%94%9F%E5%83%8F%E7%B4%A0%C2%B7%E9%9D%9EElectron-ff69b4)

**依赖：** `@napi-rs/canvas`（Skia 光栅）· `react-reconciler` · `yoga-layout` · `react`（peer）
**本包即 UI 核心** —— `-chart` / `-pro` / `-dev` / `-web3` / `-webview` 等独立包都以它为 peer 依赖回取核心符号。

> 📦 本仓库为**编译分发产物**：`index.js`（napi 装载器）+ `*.node`（原生二进制）+ `dist/src`（编译后的库 JS + 类型声明）。源码在独立仓库，此处只发布可直接 `require` / `npm install` 的成品。

[English](./README.md)

---

## 界面一览

<table>
  <tr>
    <td align="center"><b>欢迎页 · 暗色</b><br/><img src="./shots/gallery-dark.png" alt="Gallery 首页（暗色）" /></td>
    <td align="center"><b>欢迎页 · 亮色</b><br/><img src="./shots/gallery-light.png" alt="Gallery 首页（亮色）" /></td>
  </tr>
  <tr>
    <td align="center"><b>设计 Token</b><br/><img src="./shots/theme.png" alt="主题 Token 体系" /></td>
    <td align="center"><b>图表 · 水平生态树</b><br/><img src="./shots/dendrogram.png" alt="水平生态树图" /></td>
  </tr>
  <tr>
    <td align="center"><b>Web3 · 币种图标</b><br/><img src="./shots/coinicon.png" alt="币种图标墙" /></td>
    <td align="center"><b>Web3 · 币价实时看板</b><br/><img src="./shots/crypto-live.png" alt="币价实时看板" /></td>
  </tr>
</table>

*以上截图横跨整个生态（核心 UI + 图表 + Web3），全部由这套自绘栈渲染 —— 全程无浏览器参与。*

> 🎮 **看实际运行效果。** 以上每一张截图 —— 以及 100+ 个可交互 demo —— 都跑在 gallery 展示应用里。源码见 **[react-native-flux-desktop-gallery](https://github.com/keyonByIos/react-native-flux-desktop-gallery)**。

## 它是什么

`react-native-flux-desktop` 是一个**自绘的 React Renderer**：它实现 `react-reconciler` 的宿主接口，把元素树映射成自定义**场景树**，经 **Yoga** 布局、由 **Skia** 逐像素光栅化，最后 blit 到**自研底座**（`napi-rs` 原生层）驱动的窗口上屏。内置 80+ 自绘组件（对齐 Ant Design v5 的 API 与 token）、完整的主题系统与动画库。

## 特性亮点

- **纯自绘组件族** 80+：`Button` / `Input` / `Select` / `Menu` / `Table` / `Modal` / `Drawer` / `Tabs` / `DatePicker` / `Tree` / `Upload` …
- **token 主题系统**：明 / 暗 × 密度（紧凑 / 宽松）× 主色，三维正交可叠加，`useToken` 一处取色。
- **动画库**：补间 `useTween` · 弹簧 `useSpring` · 进场 `FadeIn` / `MoveIn` / `ScaleIn` · 错峰 `Stagger` · FLIP · 序列编排 · 预设墙。
- **多窗口 + 托盘**：一进程多窗、系统托盘、单实例锁与「次实例唤起老窗」。
- **轻量持久化**：内置 KV 存储（`Application.user` / `kv`），无需外部数据库。
- **CPU / GPU 双后端**：同一套绘制，按机器 / 场景切换上屏档位，支持 DPR 封顶。
- **零内嵌浏览器**：核心不含 WebView，需要时以独立可选包 `-webview` 引入。

## 安装

```bash
npm install react-native-flux-desktop
```

自动带来 `@napi-rs/canvas` / `react-reconciler` / `yoga-layout`；`react@18` 为 peer。原生二进制按平台随包发布（当前：Windows x64 MSVC）。

## 用法

根节点用 `<Window>` 声明一扇窗，`render()` 提交整棵树：

```tsx
import React from 'react';
import { render, Window, View, Text, Pressable } from 'react-native-flux-desktop';

function App() {
  const [count, setCount] = React.useState(0);
  return (
    <Window title="Hello Flux" width={520} height={420}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 22 }}>点我：{count}</Text>
        <Pressable onPress={() => setCount((c) => c + 1)}
          style={{ marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#1677ff' }}>
          <Text style={{ color: '#fff' }}>+1</Text>
        </Pressable>
      </View>
    </Window>
  );
}

render(React.createElement(App));
```

用 token 主题包裹组件族：

```tsx
import { FluxProvider } from 'react-native-flux-desktop';
render(<FluxProvider dark><MyApp /></FluxProvider>);
```

## 能力清单

**原生层（napi）**
- 窗口：创建 / 关闭 / 多窗、标题、尺寸 / 位置、最大化 / 最小化 / 还原、无边框 / 透明、DPR、光标、任务栏图标（AUMID）
- 系统托盘：建 / 换图标 / 提示、事件回抛 · 剪贴板读写 · 离屏抓帧（`grabPixels`）
- 键值持久化：`kvOpen` / `kvPut` / `kvGet` / `kvDel` / `kvKeys` / `kvCompact`

**JS 层（`dist/src`）**
- `render` / `hotReload` / `grabAll` · `Window` / `View` / `Text` / `Image` / `Pressable` / `ScrollView`
- `Application` 全局单例：窗口注册表 · `config`（主题 / 偏好 / 渲染档位）· `user`（持久化）· `relaunch` · `log`
- 主题：`FluxProvider` / `useToken` / `createTheme` · 动画：`useTween` / `useSpring` / `FadeIn` / `Stagger` / `Flip` …
- 字体：`registerFonts` / `listFontFamilies` · 日志：`configureLogger` / `readLogTail` · 运行时取数：`systemStats` · 单实例：`acquireSingleInstance` / `onSecondInstance`

完整符号见 `index.d.ts` 与 `dist/src/index.d.ts`。

## 渲染档位：CPU / GPU

同一套绘制支持两种上屏方式，运行时可切换（`Application.config` 持久化偏好，切换后重启生效）：

- **CPU** — `softbuffer` 逐帧 blit，兼容性最好、无 GPU 驱动依赖。
- **GPU** — Skia Ganesh + GL `flush/swap` 直呈，大画面 / 高频重绘更省。

DPR（分辨率倍数）可封顶以控成本；GPU 模式下窗口尺寸恒绑原生 scale。

## 字体与资源

字体在 **`app.json`** 里声明为应用资源，经入口注入环境变量，首帧前由 `registerFonts()` 注册：

```jsonc
{
  "defaultFont": "",                 // 全局默认族（留空走内置）
  "fonts": [
    { "family": "Arial", "file": "C:/Windows/Fonts/arial.ttf", "bold": "C:/Windows/Fonts/arialbd.ttf" },
    { "family": "MySans", "file": "assets/fonts/my-sans.ttf" } // 相对路径随包 assets/ 自动内嵌
  ]
}
```

- **全局字体**：`Application.setFont(family)` → 写偏好 + 重启（影响全局布局度量）。
- **局部字体**：`<Text style={{ fontFamily: 'Arial' }}>` → 该子树热更新，即时生效。
- **豆腐兜底链**：主字体缺字时自动回落内置含 CJK 的字体，纯拉丁字体下中文仍正常显示。

## 生态（已拆分的独立包）

组件族按能力拆成若干**独立发布包**，均以本包为 **peerDependency**（可选）回取核心符号 —— 保持核心精简、按需引入、共享单一 React 实例：

| 包 | 角色 | 依赖 |
| --- | --- | --- |
| **react-native-flux-desktop** | 渲染栈 + 基础 UI 组件族 + 主题 + 动画 + 原生能力（本仓库） | — |
| **react-native-flux-desktop-chart** | 图表族（Skia 自绘，`@ant-design/charts` 风格数据模型） | core |
| **react-native-flux-desktop-pro** | 高阶复合组件（ProTable / ProForm / ProCard / TrendCard …） | core + chart |
| **react-native-flux-desktop-dev** | 开发者 / 诊断组件（CodeBlock / Markdown / JsonViewer / DiffViewer / Terminal / MemMonitor …） | core + chart |
| **react-native-flux-desktop-web3** | Web3 / 加密 UI（CoinIcon / Address / TokenPrice / NFTCard …） | core |
| **react-native-flux-desktop-webview** | 可选 WebView（Chromium / WebView2，view-only + JS 双向桥；自带 `.node`） | core |
| **react-native-flux-desktop-packer** | 打包 CLI（`flux-pack`：Go launcher + `go:embed` → 自包含 `.exe`） | devDependency |
| **react-native-flux-desktop-gallery** | 可运行的 demo 展示应用（100+ 个）消费以上全部包 —— [在此查看示例](https://github.com/keyonByIos/react-native-flux-desktop-gallery) | 全部包 |

各仓库均在 `github.com/keyonByIos/<包名>`。

## 打包成 exe

用 `react-native-flux-desktop-packer`：装为 devDependency，在 `app.json` 配 `output` / `main`，运行：

```bash
npx flux-pack
```

产出自包含的 Windows `.exe`（Go 启动器 + 内嵌 payload，含 `assets/` 资源树）。

## 说明

- **平台**：当前原生二进制面向 **Windows x64（MSVC）**；Node `>= 18`。
- `-webview` 子面基于 WebView2（Chromium），Windows 需系统装有 **WebView2 Runtime**；它是独立可选包，主包默认不含。
- 本仓库为编译产物，`dist/` 与 `*.node` 即发布内容（已从 `.gitignore` 放开，`git add` 会纳入）。

## 许可证

MIT

> English 版见 [README.md](./README.md)。
