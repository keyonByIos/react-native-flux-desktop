# react-native-flux-desktop

[**English**](./README.md) | [简体中文](./README.zh-CN.md)

A self-contained **desktop rendering stack for React** — no Electron, no WebView, no Qt.

React elements are rendered by a custom reconciler into a scene tree, laid out with **Yoga**, painted with **Skia**, and presented onto native OS windows through an **in-house desktop base** and a Rust native addon. The result is a small standalone `.exe`-friendly runtime that draws real pixels with either a CPU pixel-blit pipeline or an optional GPU canvas2d path, and is fully DPI-aware.

> This repository is the **compiled distribution** of the library: the prebuilt native addon (`*.node`), transpiled JavaScript and TypeScript declarations. It contains no build toolchain and no Rust/C++ source.

## Features

### Rendering & windowing
- Multi-window: create / close / focus / center, size & position control, min/max size, decorations, maximize / minimize, always-on-top, transparent windows
- System tray with icon swap, tooltip and event callbacks; taskbar icon via per-process AppUserModelID
- Single-instance lock with second-instance wake-up IPC
- HiDPI scaling, cursor shape control, native clipboard read/write, OS-level file drag & drop
- Menu dismiss watcher (click-outside detection against screen-space rects)
- Append-only **KV store** (`kvPut` / `kvGet` / `kvKeys` / `kvCompact`) and leveled **file logger**
- Optional GPU canvas2d context (`GpuCtx2D`) with text, paths, SVG path fill, image blitting

### Component library (antd-flavored)
- **80+ UI components**: Button, Table, ProTable, Form, ProForm, Modal, Drawer, Select, Cascader, DatePicker, Tabs, Menu, Tree, TreeSelect, Transfer, Upload, Steps, Timeline, Calendar, Carousel, ColorPicker, QrCode, Watermark, Skeleton, Splitter, Masonry, Anchor, BackTop, Affix, message / notification / Modal.confirm (imperative APIs with in-tree contextHolder, no portal needed)…
- **Theme system** in the antd-style token pyramid: seed → map → alias → component tokens, dark/light algorithms, `FluxProvider` + `useToken()`
- **Charts**: 35+ chart types including finance (candlestick, depth, time-sharing, indicator overlays), statistics (boxplot, violin, histogram, heatmap, calendar-heatmap), relational (dendrogram, compact-box, indented tree, mind map, org chart, flow chart, sankey, treemap, sunburst) and classics (line / area / bar / column / pie / radar / rose / gauge / funnel…)
- **Animation**: `useSpring`, `useTween`, `FadeIn` / `MoveIn` / `ScaleIn` / `RotateIn`, `Stagger`, `Flip`, `Transition`, sequence runner, easing presets
- **Web3 widgets**: address / token price / price range / NFT card / generative avatar
- **Dev tools**: terminal & SSH terminal (VT grid screen), diff viewer, JSON viewer, log viewer, markdown & code block renderers with syntax highlighting

## Platform support

| Platform | Status |
|---|---|
| Windows x64 (MSVC) | ✅ shipped (`react-native-flux-desktop.win32-x64-msvc.node`) |
| macOS / Linux | ⛔ not yet |

## Install

```sh
# from the npm registry (recommended)
npm install react-native-flux-desktop

# or straight from GitHub (requires git on the machine)
npm install github:keyonByIos/react-native-flux-desktop

# or as a local file dependency
npm install file:../react-native-flux-desktop-pkg --install-links
```

> When using a `file:` dependency, pass `--install-links` so npm creates a real
> copy instead of a junction/symlink — otherwise peer resolution of
> `react` / the Skia canvas dependency can fail at runtime.

Requirements:
- Node.js ≥ 18 (N-API ≥ 6)
- `react@18.3.1` (exact major; the reconciler fork is pinned)
- Set `FLUX_PACKAGED=1` in the environment when running the packaged build
  (routes the KV/log data directory to a writable location)

## Quick start

```tsx
import {
  render, Window, FluxProvider, View, Text, Button,
} from 'react-native-flux-desktop';

// render() boots the event pump and commits the tree; every <Window>
// element in the tree maps to one native OS window.
render(
  <Window title="Hello Flux" width={1280} height={800}>
    <FluxProvider>
      <View style={{ padding: 24 }}>
        <Text>Hello desktop</Text>
        <Button type="primary">Click me</Button>
      </View>
    </FluxProvider>
  </Window>,
);
```

*(The `Application` singleton adds persistent config, window bookkeeping, tray
and logging on top of the raw pipeline — see the type declarations under
`dist/src/` for the full API surface.)*

## Example: the Gallery app

A complete demo application — 120+ demo pages covering UI components, charts,
animation, multi-window, system tray, dev tools and Web3 widgets — lives in
[`example/`](./example). It consumes this package exactly like any end user
would (`import { Button } from 'react-native-flux-desktop'`), so it doubles as
an integration smoke test.

```sh
cd example
npm install
npm start          # compile (tsc) + run, CPU pixel-blit pipeline
npm run gpu        # same gallery on the GPU canvas2d pipeline
```

Requirements are the same as above (Node.js ≥ 18, Windows x64). The first
launch opens a window listing every demo; data/logs go to the
`ReactNativeFluxDesktopGallery` app directory (`FLUX_APP_DIR`).

## The `app.json` manifest

Every Flux desktop app carries an **`app.json` at its project root** (see
[`example/app.json`](./example/app.json)). It is the single source of truth
shared by the runtime and the packer:

| Field | Required | Purpose |
|---|---|---|
| `name` | ✅ | App name — window title, `.exe` file name, data/cache directory name |
| `description` | — | Written into the exe `FileDescription` version resource |
| `version` | — | Written into the exe version resource (auto-padded to `a.b.c.d`) |
| `icon` | — | PNG icon path relative to the project root, embedded into the exe (default icon otherwise) |
| `main` | — | Compiled entry JS; falls back to `package.json`'s `main` when omitted |
| `output` | — | Packaged output directory (default `build`) |
| `logger` | — | `{ path, level }` — log root directory (empty → default data dir) and minimum capture level |
| `allowMultiOpen` | — | Allow launching more than one instance (otherwise the single-instance lock applies) |

The packer validates hard and fails fast: a missing `name`, an entry file that
does not exist, or an entry **older than any source file** (you forgot to
rebuild) all abort packaging, with the exact fix spelled out in the error.

## Repository layout

```
index.js                                   # native addon loader: createWindow / present / kv* / tray / clipboard
index.d.ts                                 # typings for the native addon
react-native-flux-desktop*.node            # prebuilt native addon (win32-x64-msvc)
package.json
dist/src/index.js|d.ts                     # library entry (package "main" / "types")
dist/src/{ui,chart,pro,web3,io,dev,...}/   # compiled modules with .d.ts files
example/                                   # Gallery demo app (source, consumes the published package)
```

The `dist/src/**` tree preserves the original source layout on purpose: some
modules require the loader via a fixed relative depth (`../../../index.js`), so
the tree must not be flattened or bundled.

## Related

- [react-native-flux](https://github.com/keyonByIos/react-native-flux) — parent repository; this package is included as a git submodule under `packages/react-native-flux-desktop`.

## License

[MIT](./LICENSE)
